package domain

import (
	"testing"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

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
