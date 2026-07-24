package domain

import "testing"

func TestValidateCreateNormalizesDomain(t *testing.T) {
	domainName, provider, providerRegion, err := validateCreate(CreateRequest{
		Domain:         " HTTPS://Mail.Example.COM/path ",
		ProviderRegion: " us-east-1 ",
	})
	if err != nil {
		t.Fatalf("validateCreate returned error: %v", err)
	}
	if domainName != "mail.example.com" {
		t.Fatalf("domainName = %q, want mail.example.com", domainName)
	}
	if provider != DefaultProvider {
		t.Fatalf("provider = %q, want %s", provider, DefaultProvider)
	}
	if providerRegion != "us-east-1" {
		t.Fatalf("providerRegion = %q, want us-east-1", providerRegion)
	}
}

func TestValidateCreateRejectsInvalidDomain(t *testing.T) {
	_, _, _, err := validateCreate(CreateRequest{
		Domain:         "not a domain",
		ProviderRegion: "us-east-1",
	})
	if err == nil {
		t.Fatal("validateCreate returned nil error for invalid domain")
	}
}

func TestValidateCreateRequiresProviderRegion(t *testing.T) {
	_, _, _, err := validateCreate(CreateRequest{Domain: "example.com"})
	if err == nil {
		t.Fatal("validateCreate returned nil error without provider region")
	}
}
