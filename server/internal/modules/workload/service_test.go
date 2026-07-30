package workload

import (
	"testing"
	"time"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

func TestValidateMutationRestrictsWorkloadPermissions(t *testing.T) {
	valid := MutationRequest{Name: "mailer", Permissions: []string{string(tenant.PermissionEmailSend), string(tenant.PermissionEmailSend)}}
	_, _, permissions, err := validateMutation(valid)
	if err != nil || len(permissions) != 1 {
		t.Fatalf("validateMutation() = %v, %v", permissions, err)
	}
	invalid := MutationRequest{Name: "admin", Permissions: []string{string(tenant.PermissionTeamMemberInvite)}}
	if _, _, _, err := validateMutation(invalid); err == nil {
		t.Fatal("accepted human administration permission")
	}
}

func TestCredentialExpiry(t *testing.T) {
	now := time.Unix(1_700_000_000, 0).UTC()
	service := &Service{now: func() time.Time { return now }}
	expires, err := service.credentialExpiry(nil)
	if err != nil || !expires.Equal(now.Add(defaultCredentialTTL)) {
		t.Fatalf("credentialExpiry() = %v, %v", expires, err)
	}
	tooLate := now.Add(maxCredentialTTL + time.Minute)
	if _, err := service.credentialExpiry(&tooLate); err == nil {
		t.Fatal("accepted credential beyond maximum TTL")
	}
}

func TestFederatedClaimsValidation(t *testing.T) {
	t.Parallel()
	if !audienceAllowed([]string{"api://dugble"}, []string{"other", "api://dugble"}) {
		t.Fatal("expected matching audience")
	}
	if audienceAllowed([]string{"attacker"}, []string{"api://dugble"}) {
		t.Fatal("accepted unexpected audience")
	}
	claims := map[string]any{"repository": "dugble/server", "environment": "production"}
	if !claimsMatch(claims, map[string]string{"repository": "dugble/server"}) {
		t.Fatal("expected matching claims")
	}
	if claimsMatch(claims, map[string]string{"environment": "staging"}) {
		t.Fatal("accepted mismatched required claim")
	}
}
func TestNormalizedStrings(t *testing.T) {
	t.Parallel()
	got := normalizedStrings([]string{" audience ", "", "audience"})
	if len(got) != 1 || got[0] != "audience" {
		t.Fatalf("unexpected values: %v", got)
	}
}
