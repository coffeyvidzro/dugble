package teamtoken

import (
	"testing"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

func TestValidatePermissionsAllowsEmailScopes(t *testing.T) {
	permissions, err := validatePermissions([]string{
		string(tenant.PermissionEmailRead),
		string(tenant.PermissionEmailSend),
	})
	if err != nil {
		t.Fatalf("validatePermissions() error = %v", err)
	}
	if len(permissions) != 2 {
		t.Fatalf("len(permissions) = %d, want 2", len(permissions))
	}
	if permissions[0] != string(tenant.PermissionEmailRead) {
		t.Fatalf("permissions[0] = %q, want %q", permissions[0], tenant.PermissionEmailRead)
	}
	if permissions[1] != string(tenant.PermissionEmailSend) {
		t.Fatalf("permissions[1] = %q, want %q", permissions[1], tenant.PermissionEmailSend)
	}
}

func TestValidatePermissionsAllowsSMSScopes(t *testing.T) {
	permissions, err := validatePermissions([]string{
		string(tenant.PermissionSMSRead),
		string(tenant.PermissionSMSSend),
	})
	if err != nil {
		t.Fatalf("validatePermissions() error = %v", err)
	}
	if len(permissions) != 2 {
		t.Fatalf("len(permissions) = %d, want 2", len(permissions))
	}
	if permissions[0] != string(tenant.PermissionSMSRead) {
		t.Fatalf("permissions[0] = %q, want %q", permissions[0], tenant.PermissionSMSRead)
	}
	if permissions[1] != string(tenant.PermissionSMSSend) {
		t.Fatalf("permissions[1] = %q, want %q", permissions[1], tenant.PermissionSMSSend)
	}
}

func TestValidatePermissionsRejectsPrivilegedScope(t *testing.T) {
	_, err := validatePermissions([]string{"root:all"})
	if err == nil {
		t.Fatal("validatePermissions() error = nil, want unsupported permission error")
	}
}

func TestValidateMutationRejectsInvalidName(t *testing.T) {
	if _, _, _, err := validateMutation(" ", []string{"team:read"}, nil); err == nil {
		t.Fatal("validateMutation() accepted an empty name")
	}
}

func TestValidateTokenIDRejectsInvalidID(t *testing.T) {
	if _, err := validateTokenID("invalid"); err == nil {
		t.Fatal("validateTokenID() accepted an invalid id")
	}
}
