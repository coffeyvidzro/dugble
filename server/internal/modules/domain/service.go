package domain

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const manualHealthFailureReason = "sender domain verification checks no longer pass"

type Service struct {
	repository *Repository
	provider   platformemail.DomainProvider
	dns        platformemail.DNSVerifier
}

type ReconciliationResult struct {
	Status              string
	VerificationRecords []VerificationRecord
}

func NewService(repository *Repository, provider platformemail.DomainProvider, dns platformemail.DNSVerifier) *Service {
	return &Service{repository: repository, provider: provider, dns: dns}
}

func (s *Service) List(ctx context.Context) ([]SenderDomain, error) {
	tc, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsRead)
	if err != nil {
		return nil, err
	}
	domains, err := s.repository.List(ctx, tc.Scope.TeamID)
	if err != nil {
		return nil, apperrors.NewInternal("Unable to list sender domains", err)
	}
	return domains, nil
}

func (s *Service) Get(ctx context.Context, domainID string) (SenderDomain, error) {
	tc, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsRead)
	if err != nil {
		return SenderDomain{}, err
	}
	id, err := parseDomainID(domainID)
	if err != nil {
		return SenderDomain{}, err
	}
	domain, err := s.repository.Get(ctx, id, tc.Scope.TeamID)
	if err != nil {
		return SenderDomain{}, apperrors.NewNotFound("Sender domain not found")
	}
	return domain, nil
}

func (s *Service) Create(ctx context.Context, req CreateRequest) (SenderDomain, error) {
	tc, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsCreate)
	if err != nil {
		return SenderDomain{}, err
	}
	domainName, region, returnPath, err := validateCreate(req)
	if err != nil {
		return SenderDomain{}, err
	}
	if s.provider == nil {
		return SenderDomain{}, apperrors.NewInternal("Sender domain provider is not configured", nil)
	}

	domain, err := s.repository.Create(ctx, tc.Scope.TeamID, domainName, DefaultProvider, region, []VerificationRecord{}, tc.Actor.UserID)
	if err != nil {
		if errors.Is(err, ErrSenderDomainAlreadyExists) {
			return SenderDomain{}, apperrors.NewConflict("Sender domain already exists")
		}
		return SenderDomain{}, apperrors.NewInternal("Unable to create sender domain", err)
	}
	id := uuid.MustParse(domain.ID)

	records, provisionErr := s.provider.ProvisionDomain(ctx, platformemail.DomainProvisionRequest{
		Domain: domainName, Region: region, CustomReturnPath: returnPath,
	})
	if provisionErr != nil {
		reason := provisionErr.Error()
		_, _ = s.repository.UpdateVerification(ctx, id, tc.Scope.TeamID, StatusFailed, []VerificationRecord{}, &reason)
		return SenderDomain{}, apperrors.NewInternal("Unable to provision sender domain", provisionErr)
	}
	updated, saveErr := s.repository.UpdateVerification(ctx, id, tc.Scope.TeamID, StatusPending, records, nil)
	if saveErr == nil {
		return updated, nil
	}

	cleanupErr := s.provider.DeleteDomain(ctx, domainName, region)
	reason := "unable to save sender domain verification records"
	if cleanupErr != nil {
		reason = fmt.Sprintf("%s; provider cleanup failed: %v", reason, cleanupErr)
	}
	_, _ = s.repository.UpdateVerification(ctx, id, tc.Scope.TeamID, StatusFailed, []VerificationRecord{}, &reason)
	if cleanupErr != nil {
		saveErr = errors.Join(saveErr, cleanupErr)
	}
	return SenderDomain{}, apperrors.NewInternal("Unable to save sender domain verification records", saveErr)
}

func (s *Service) Verify(ctx context.Context, domainID string) (SenderDomain, error) {
	tc, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsCreate)
	if err != nil {
		return SenderDomain{}, err
	}
	id, err := parseDomainID(domainID)
	if err != nil {
		return SenderDomain{}, err
	}
	domain, err := s.repository.Get(ctx, id, tc.Scope.TeamID)
	if err != nil {
		return SenderDomain{}, apperrors.NewNotFound("Sender domain not found")
	}
	if domain.Status == StatusDisabled {
		return SenderDomain{}, apperrors.NewConflict("Disabled sender domains cannot be verified")
	}
	if s.provider == nil || s.dns == nil {
		return SenderDomain{}, apperrors.NewInternal("Sender domain verification is not configured", nil)
	}

	result, checkErr := s.Check(ctx, domain)
	if domain.Status == StatusVerified {
		records, reason := manualHealthObservation(domain, result, checkErr)
		updated, updateErr := s.repository.UpdateManualHealthCheck(ctx, id, tc.Scope.TeamID, records, reason)
		if updateErr != nil {
			return SenderDomain{}, apperrors.NewInternal("Unable to update sender domain health", updateErr)
		}
		return updated, nil
	}
	if checkErr != nil {
		reason := checkErr.Error()
		updated, updateErr := s.repository.UpdateVerification(ctx, id, tc.Scope.TeamID, StatusFailed, domain.VerificationRecords, &reason)
		if updateErr != nil {
			return SenderDomain{}, apperrors.NewInternal("Unable to update sender domain verification", updateErr)
		}
		return updated, nil
	}

	updated, err := s.repository.UpdateVerification(ctx, id, tc.Scope.TeamID, result.Status, result.VerificationRecords, nil)
	if err != nil {
		return SenderDomain{}, apperrors.NewInternal("Unable to update sender domain verification", err)
	}
	return updated, nil
}

func manualHealthObservation(domain SenderDomain, result ReconciliationResult, checkErr error) ([]VerificationRecord, *string) {
	if checkErr != nil {
		reason := checkErr.Error()
		return domain.VerificationRecords, &reason
	}
	if result.Status != StatusVerified {
		reason := manualHealthFailureReason
		return result.VerificationRecords, &reason
	}
	return result.VerificationRecords, nil
}

func (s *Service) Check(ctx context.Context, domain SenderDomain) (ReconciliationResult, error) {
	if s.provider == nil || s.dns == nil {
		return ReconciliationResult{}, errors.New("sender domain verification is not configured")
	}
	providerStatus, err := s.provider.GetDomainStatus(ctx, domain.Domain, domain.ProviderRegion)
	if err != nil {
		return ReconciliationResult{}, err
	}
	records := append([]VerificationRecord(nil), domain.VerificationRecords...)
	for index := range records {
		verified := s.dns.Verify(ctx, domain.Domain, records[index])
		if records[index].Record == platformemail.RecordDKIM {
			verified = verified && providerStatus.DKIMVerified
		}
		records[index].Status = platformemail.RecordStatusPending
		if verified {
			records[index].Status = platformemail.RecordStatusVerified
		}
	}
	return ReconciliationResult{Status: verificationStatus(records, providerStatus), VerificationRecords: records}, nil
}

func verificationStatus(records []VerificationRecord, providerStatus platformemail.DomainStatus) string {
	if len(records) == 0 {
		return StatusPending
	}
	for _, record := range records {
		if record.Status != platformemail.RecordStatusVerified {
			return StatusPending
		}
	}
	if providerStatus.IdentityVerified && providerStatus.DKIMVerified && providerStatus.MailFromVerified {
		return StatusVerified
	}
	return StatusPending
}

func (s *Service) Delete(ctx context.Context, domainID string) (SenderDomain, error) {
	tc, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsDelete)
	if err != nil {
		return SenderDomain{}, err
	}
	id, err := parseDomainID(domainID)
	if err != nil {
		return SenderDomain{}, err
	}
	if s.provider == nil {
		return SenderDomain{}, apperrors.NewInternal("Sender domain provider is not configured", nil)
	}

	domain, err := s.repository.Disable(ctx, id, tc.Scope.TeamID)
	if err != nil {
		return SenderDomain{}, apperrors.NewNotFound("Sender domain not found")
	}
	if err := s.provider.DeleteDomain(ctx, domain.Domain, domain.ProviderRegion); err != nil {
		return domain, apperrors.NewInternal("Unable to delete sender domain from provider; the domain has been disabled", err)
	}
	purged, err := s.repository.PurgeIfUnreferenced(ctx, id, tc.Scope.TeamID)
	if err != nil {
		return domain, apperrors.NewInternal("Sender domain was removed from provider but local cleanup failed", err)
	}
	if purged {
		return domain, nil
	}
	return s.repository.Get(ctx, id, tc.Scope.TeamID)
}

func requireTenantPermission(ctx context.Context, permission tenant.Permission) (tenant.AccessContext, error) {
	tc, decision := tenant.ResolveAccess(ctx, permission)
	if !decision.Allowed {
		return tenant.AccessContext{}, apperrors.NewForbidden(decision.Reason)
	}
	return tc, nil
}
