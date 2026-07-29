package domain

import (
	"context"
	"errors"
	"testing"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
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
