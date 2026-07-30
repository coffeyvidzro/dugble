package tenant

import "testing"

func TestAdminCanWriteWorkloads(t *testing.T) {
	t.Parallel()

	if !Can(RoleAdmin, PermissionWorkloadsWrite) {
		t.Fatal("Can(RoleAdmin, PermissionWorkloadsWrite) = false, want true")
	}
}
