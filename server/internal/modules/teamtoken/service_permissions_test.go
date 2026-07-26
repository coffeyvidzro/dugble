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

func TestValidatePermissionsRejectsPrivilegedScope(t *testing.T) {
	_, err := validatePermissions([]string{string(tenant.PermissionWalletTopUp)})
	if err == nil {
		t.Fatal("validatePermissions() error = nil, want unsupported permission error")
	}
}
