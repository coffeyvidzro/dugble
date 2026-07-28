package domain

import (
	"context"
	"errors"
	"regexp"
	"strings"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

const maxDomainLength = 253

var (
	domainPattern    = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$`)
	labelPattern     = regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$`)
	supportedRegions = map[string]struct{}{
		"us-east-1": {}, "eu-west-1": {}, "sa-east-1": {}, "ap-northeast-1": {},
	}
)

type Service struct {
	repository *Repository
	provider   DomainProvider
	dns        DNSVerifier
}

func NewService(repository *Repository, provider DomainProvider, dns DNSVerifier) *Service {
	return &Service{repository: repository, provider: provider, dns: dns}
}

func (s *Service) List(ctx context.Context) ([]SenderDomain, error) {
	tc, err := requireTenantPermission(ctx, tenant.PermissionSenderDomainsRead)
	if err != nil {
		return nil, err
	}
	domains, err := s.repository.List(ctx, tc.TeamID)
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
	domain, err := s.repository.Get(ctx, id, tc.TeamID)
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

	domain, err := s.repository.Create(ctx, tc.TeamID, domainName, DefaultProvider, region, []VerificationRecord{}, tc.UserID)
	if err != nil {
		if errors.Is(err, ErrSenderDomainAlreadyExists) {
			return SenderDomain{}, apperrors.NewConflict("Sender domain already exists")
		}
		return SenderDomain{}, apperrors.NewInternal("Unable to create sender domain", err)
	}

	records, provisionErr := s.provider.Provision(ctx, ProvisionRequest{Domain: domainName, Region: region, CustomReturnPath: returnPath})
	if provisionErr != nil {
		reason := provisionErr.Error()
		_, _ = s.repository.UpdateVerification(ctx, uuid.MustParse(domain.ID), tc.TeamID, StatusFailed, []VerificationRecord{}, &reason)
		return SenderDomain{}, apperrors.NewInternal("Unable to provision sender domain", provisionErr)
	}
	updated, err := s.repository.UpdateVerification(ctx, uuid.MustParse(domain.ID), tc.TeamID, StatusPending, records, nil)
	if err != nil {
		return SenderDomain{}, apperrors.NewInternal("Unable to save sender domain verification records", err)
	}
	return updated, nil
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
	domain, err := s.repository.Get(ctx, id, tc.TeamID)
	if err != nil {
		return SenderDomain{}, apperrors.NewNotFound("Sender domain not found")
	}
	if domain.Status == StatusDisabled {
		return SenderDomain{}, apperrors.NewConflict("Disabled sender domains cannot be verified")
	}
	if s.provider == nil || s.dns == nil {
		return SenderDomain{}, apperrors.NewInternal("Sender domain verification is not configured", nil)
	}

	providerStatus, err := s.provider.Status(ctx, domain.Domain, domain.ProviderRegion)
	if err != nil {
		reason := err.Error()
		updated, updateErr := s.repository.UpdateVerification(ctx, id, tc.TeamID, StatusFailed, domain.VerificationRecords, &reason)
		if updateErr != nil {
			return SenderDomain{}, apperrors.NewInternal("Unable to update sender domain verification", updateErr)
		}
		return updated, nil
	}

	allDNSVerified := true
	for index := range domain.VerificationRecords {
		verified := s.dns.Verify(ctx, domain.Domain, domain.VerificationRecords[index])
		if domain.VerificationRecords[index].Record == RecordDKIM {
			verified = verified && providerStatus.DKIMVerified
		}
		domain.VerificationRecords[index].Status = RecordStatusPending
		if verified {
			domain.VerificationRecords[index].Status = RecordStatusVerified
		} else {
			allDNSVerified = false
		}
	}

	status := StatusPending
	if allDNSVerified && providerStatus.IdentityVerified && providerStatus.DKIMVerified && providerStatus.MailFromVerified {
		status = StatusVerified
	}
	updated, err := s.repository.UpdateVerification(ctx, id, tc.TeamID, status, domain.VerificationRecords, nil)
	if err != nil {
		return SenderDomain{}, apperrors.NewInternal("Unable to update sender domain verification", err)
	}
	return updated, nil
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
	domain, err := s.repository.Delete(ctx, id, tc.TeamID)
	if err != nil {
		return SenderDomain{}, apperrors.NewNotFound("Sender domain not found")
	}
	return domain, nil
}

func validateCreate(req CreateRequest) (string, string, string, error) {
	domainName := normalizeDomain(req.Domain)
	region := strings.ToLower(strings.TrimSpace(req.Region))
	returnPath := strings.ToLower(strings.TrimSpace(req.CustomReturnPath))
	if region == "" {
		region = DefaultRegion
	}
	if returnPath == "" {
		returnPath = DefaultCustomReturnPath
	}
	if domainName == "" {
		return "", "", "", apperrors.NewBadRequest("Sender domain is required")
	}
	if len(domainName) > maxDomainLength || !domainPattern.MatchString(domainName) {
		return "", "", "", apperrors.NewBadRequest("Sender domain must be a valid domain name")
	}
	if _, ok := supportedRegions[region]; !ok {
		return "", "", "", apperrors.NewBadRequest("Sender domain region is not supported")
	}
	if !labelPattern.MatchString(returnPath) {
		return "", "", "", apperrors.NewBadRequest("Custom return path must be a valid DNS label")
	}
	return domainName, region, returnPath, nil
}

func normalizeDomain(value string) string {
	domainName := strings.TrimSpace(strings.ToLower(value))
	domainName = strings.TrimPrefix(domainName, "http://")
	domainName = strings.TrimPrefix(domainName, "https://")
	domainName = strings.TrimSuffix(domainName, ".")
	if before, _, ok := strings.Cut(domainName, "/"); ok {
		domainName = before
	}
	return domainName
}

func parseDomainID(value string) (uuid.UUID, error) {
	id, err := uuid.Parse(strings.TrimSpace(value))
	if err != nil {
		return uuid.Nil, apperrors.NewBadRequest("Sender domain id must be a valid UUID")
	}
	return id, nil
}

func requireTenantPermission(ctx context.Context, permission tenant.Permission) (tenant.Context, error) {
	tc, ok := tenant.FromContext(ctx)
	if !ok {
		return tenant.Context{}, apperrors.NewUnauthorized("Tenant context is required")
	}
	if !tenant.ContextCan(tc, permission) {
		return tenant.Context{}, apperrors.NewForbidden("Sender domain permission is required")
	}
	return tc, nil
}
