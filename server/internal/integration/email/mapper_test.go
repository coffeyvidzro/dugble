package email

import (
	"strings"
	"testing"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

func TestGenerateBYODKIMMaterial(t *testing.T) {
	selector, privateKey, publicKey, err := generateBYODKIMMaterial()
	if err != nil {
		t.Fatalf("generateBYODKIMMaterial returned error: %v", err)
	}
	if selector == "" || privateKey == "" || publicKey == "" {
		t.Fatal("generateBYODKIMMaterial returned an empty value")
	}
	if len(selector) > 63 || !strings.HasPrefix(selector, "dugble") {
		t.Fatalf("selector = %q", selector)
	}
}

func TestMapVerificationRecords(t *testing.T) {
	records := mapVerificationRecords(platformemail.DomainProvisionRequest{
		Domain:           "example.com",
		Region:           "us-east-1",
		CustomReturnPath: "send",
	}, "dugble123", "public-key")

	if len(records) != 3 {
		t.Fatalf("records length = %d, want 3", len(records))
	}
	if records[0].Record != platformemail.RecordDKIM || records[0].Type != platformemail.RecordTypeTXT {
		t.Fatalf("DKIM record = %#v", records[0])
	}
	if records[1].Record != platformemail.RecordSPF || records[1].Type != platformemail.RecordTypeMX || records[1].Priority == nil || *records[1].Priority != 10 {
		t.Fatalf("MAIL FROM record = %#v", records[1])
	}
	if records[2].Record != platformemail.RecordSPF || records[2].Type != platformemail.RecordTypeTXT {
		t.Fatalf("SPF record = %#v", records[2])
	}
}
