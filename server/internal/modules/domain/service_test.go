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

func TestValidateCreateNormalizesDomain(t *testing.T) {
	domainName, region, returnPath, err := validateCreate(CreateRequest{
		Domain:           " HTTPS://Mail.Example.COM/path ",
		Region:           " us-east-1 ",
		CustomReturnPath: " Bounce ",
	})
	if err != nil {
		t.Fatalf("validateCreate returned error: %v", err)
	}
	if domainName != "mail.example.com" {
		t.Fatalf("domainName = %q, want mail.example.com", domainName)
	}
	if region != "us-east-1" {
		t.Fatalf("region = %q, want us-east-1", region)
	}
	if returnPath != "bounce" {
		t.Fatalf("returnPath = %q, want bounce", returnPath)
	}
}

func TestValidateCreateUsesDefaults(t *testing.T) {
	domainName, region, returnPath, err := validateCreate(CreateRequest{Domain: "example.com"})
	if err != nil {
		t.Fatalf("validateCreate returned error: %v", err)
	}
	if domainName != "example.com" || region != DefaultRegion || returnPath != DefaultCustomReturnPath {
		t.Fatalf("validateCreate = %q, %q, %q", domainName, region, returnPath)
	}
}

func TestValidateCreateRejectsInvalidDomain(t *testing.T) {
	_, _, _, err := validateCreate(CreateRequest{Domain: "not a domain"})
	if err == nil {
		t.Fatal("validateCreate returned nil error for invalid domain")
	}
}

func TestValidateCreateRejectsUnsupportedRegion(t *testing.T) {
	_, _, _, err := validateCreate(CreateRequest{Domain: "example.com", Region: "us-west-2"})
	if err == nil {
		t.Fatal("validateCreate returned nil error for unsupported region")
	}
}

func TestValidateCreateRejectsInvalidReturnPath(t *testing.T) {
	_, _, _, err := validateCreate(CreateRequest{Domain: "example.com", CustomReturnPath: "bad.path"})
	if err == nil {
		t.Fatal("validateCreate returned nil error for invalid return path")
	}
}
