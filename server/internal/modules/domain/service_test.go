package domain

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/modules/emailtenant"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type checkProvider struct {
	status platformemail.DomainStatus
	err    error
}

func (p checkProvider) ProvisionDomain(context.Context, platformemail.DomainProvisionRequest) ([]platformemail.VerificationRecord, error) {
	return nil, nil
}
func (p checkProvider) GetDomainStatus(context.Context, string, string) (platformemail.DomainStatus, error) {
	return p.status, p.err
}
func (p checkProvider) DeleteDomain(context.Context, string, string) error { return p.err }

type checkDNS bool

func (d checkDNS) Verify(context.Context, string, platformemail.VerificationRecord) bool {
	return bool(d)
}

func TestVerificationStatusRequiresDNSRecords(t *testing.T) {
	providerStatus := platformemail.DomainStatus{
		IdentityVerified: true,
		DKIMVerified:     true,
		MailFromVerified: true,
	}

	if got := verificationStatus(nil, providerStatus); got != StatusPending {
		t.Fatalf("verificationStatus() = %q, want %q", got, StatusPending)
	}
}

func TestCheckReturnsTransientProviderFailureWithoutChangingDomain(t *testing.T) {
	providerErr := errors.New("SES unavailable")
	service := NewService(nil, checkProvider{err: providerErr}, checkDNS(true))
	domain := SenderDomain{Status: StatusPending, VerificationRecords: []VerificationRecord{{Status: platformemail.RecordStatusPending}}}
	_, err := service.Check(context.Background(), domain)
	if !errors.Is(err, providerErr) {
		t.Fatalf("Check() error = %v, want %v", err, providerErr)
	}
	if domain.Status != StatusPending || domain.VerificationRecords[0].Status != platformemail.RecordStatusPending {
		t.Fatalf("Check() mutated domain: %+v", domain)
	}
}

func TestCheckVerifiesReadyDomain(t *testing.T) {
	service := NewService(nil, checkProvider{status: platformemail.DomainStatus{
		IdentityVerified: true, DKIMVerified: true, MailFromVerified: true,
	}}, checkDNS(true))
	domain := SenderDomain{Domain: "example.com", ProviderRegion: "eu-west-1", VerificationRecords: []VerificationRecord{{Record: platformemail.RecordDKIM}}}
	result, err := service.Check(context.Background(), domain)
	if err != nil {
		t.Fatalf("Check(): %v", err)
	}
	if result.Status != StatusVerified || result.VerificationRecords[0].Status != platformemail.RecordStatusVerified {
		t.Fatalf("unexpected reconciliation result: %+v", result)
	}
}

func TestManualHealthObservationRecordsNegativeCheck(t *testing.T) {
	domain := SenderDomain{VerificationRecords: []VerificationRecord{{Status: platformemail.RecordStatusVerified}}}
	result := ReconciliationResult{
		Status:              StatusPending,
		VerificationRecords: []VerificationRecord{{Status: platformemail.RecordStatusPending}},
	}
	records, reason := manualHealthObservation(domain, result, nil)
	if reason == nil || *reason != manualHealthFailureReason {
		t.Fatalf("reason = %v, want %q", reason, manualHealthFailureReason)
	}
	if records[0].Status != platformemail.RecordStatusPending {
		t.Fatalf("records = %+v, want pending observation", records)
	}
}

func TestManualHealthObservationPreservesRecordsOnProviderError(t *testing.T) {
	providerErr := errors.New("SES unavailable")
	domain := SenderDomain{VerificationRecords: []VerificationRecord{{Status: platformemail.RecordStatusVerified}}}
	records, reason := manualHealthObservation(domain, ReconciliationResult{}, providerErr)
	if reason == nil || *reason != providerErr.Error() {
		t.Fatalf("reason = %v, want %q", reason, providerErr)
	}
	if records[0].Status != platformemail.RecordStatusVerified {
		t.Fatalf("records = %+v, want existing records preserved", records)
	}
}

func TestManualHealthObservationClearsFailureOnSuccess(t *testing.T) {
	result := ReconciliationResult{
		Status:              StatusVerified,
		VerificationRecords: []VerificationRecord{{Status: platformemail.RecordStatusVerified}},
	}
	records, reason := manualHealthObservation(SenderDomain{}, result, nil)
	if reason != nil {
		t.Fatalf("reason = %v, want nil", reason)
	}
	if records[0].Status != platformemail.RecordStatusVerified {
		t.Fatalf("records = %+v, want verified", records)
	}
}

func TestVerificationStatusRequiresAllChecks(t *testing.T) {
	verifiedProvider := platformemail.DomainStatus{
		IdentityVerified: true,
		DKIMVerified:     true,
		MailFromVerified: true,
	}
	records := []VerificationRecord{{Status: platformemail.RecordStatusVerified}}

	tests := []struct {
		name           string
		records        []VerificationRecord
		providerStatus platformemail.DomainStatus
		want           string
	}{
		{name: "all checks verified", records: records, providerStatus: verifiedProvider, want: StatusVerified},
		{name: "DNS pending", records: []VerificationRecord{{Status: platformemail.RecordStatusPending}}, providerStatus: verifiedProvider, want: StatusPending},
		{name: "provider pending", records: records, providerStatus: platformemail.DomainStatus{}, want: StatusPending},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := verificationStatus(test.records, test.providerStatus); got != test.want {
				t.Fatalf("verificationStatus() = %q, want %q", got, test.want)
			}
		})
	}
}

type provisioningStub struct {
	tenant      emailtenant.Tenant
	err         error
	requests    int
	statusReads int
}

func (s *provisioningStub) RequestProvisioning(context.Context, uuid.UUID, string) (emailtenant.Tenant, error) {
	s.requests++
	return s.tenant, s.err
}
func (s *provisioningStub) ProvisioningStatus(context.Context, uuid.UUID, string) (emailtenant.Tenant, error) {
	s.statusReads++
	return s.tenant, s.err
}

func domainAccessContext(teamID uuid.UUID) context.Context {
	return tenant.ContextWithAccess(context.Background(), tenant.AccessContext{
		Actor: tenant.Actor{Type: tenant.ActorTypeUser, UserID: uuid.New()},
		Scope: tenant.Scope{TeamID: teamID, Role: tenant.RoleOwner, Status: tenant.StatusActive},
	})
}

func TestCreateReturnsAsynchronousProvisioningStatus(t *testing.T) {
	teamID, tenantID := uuid.New(), uuid.New()
	provisioner := &provisioningStub{tenant: emailtenant.Tenant{ID: tenantID, TeamID: teamID, Region: "eu-north-1", Status: emailtenant.StatusProvisioning}}
	service := NewService(nil, checkProvider{}, checkDNS(true), provisioner)

	result, err := service.Create(domainAccessContext(teamID), CreateRequest{Domain: "example.com", Region: "eu-north-1"})
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if result.Domain != nil || result.Provisioning == nil {
		t.Fatalf("result = %#v, want provisioning status", result)
	}
	if result.Provisioning.TenantID != tenantID.String() || result.Provisioning.Status != emailtenant.StatusProvisioning || result.Provisioning.StatusURL != "/domains/provisioning/eu-north-1" {
		t.Fatalf("provisioning = %#v", result.Provisioning)
	}
}

func TestProvisioningStatusReadsExistingLifecycleWithoutScheduling(t *testing.T) {
	teamID := uuid.New()
	failure := "SES rejected the request"
	provisioner := &provisioningStub{tenant: emailtenant.Tenant{ID: uuid.New(), TeamID: teamID, Region: "eu-north-1", Status: emailtenant.StatusFailed, FailureReason: &failure}}
	service := NewService(nil, nil, nil, provisioner)

	status, err := service.ProvisioningStatus(domainAccessContext(teamID), " EU-NORTH-1 ")
	if err != nil {
		t.Fatalf("ProvisioningStatus() error = %v", err)
	}
	if status.Status != emailtenant.StatusFailed || status.FailureReason == nil || *status.FailureReason != failure {
		t.Fatalf("status = %#v", status)
	}
	if provisioner.statusReads != 1 || provisioner.requests != 0 {
		t.Fatalf("status reads = %d, requests = %d", provisioner.statusReads, provisioner.requests)
	}
}
