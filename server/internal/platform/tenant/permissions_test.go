package tenant

import "testing"

func TestProductRuntimePermissionsByRole(t *testing.T) {
	privileged := []Permission{
		PermissionVerifyRead,
		PermissionVerifySend,
		PermissionVerifyCheck,
		PermissionVerifyManage,
		PermissionInboxRead,
		PermissionInboxWrite,
		PermissionNotifyRead,
		PermissionNotifyExecute,
		PermissionNotifyManage,
		PermissionEventsRead,
		PermissionEventsManage,
		PermissionEventsReplay,
	}
	for _, role := range []string{RoleOwner, RoleAdmin} {
		for _, permission := range privileged {
			if !Can(role, permission) {
				t.Fatalf("Can(%q, %q) = false, want true", role, permission)
			}
		}
	}

	memberReads := []Permission{
		PermissionVerifyRead,
		PermissionInboxRead,
		PermissionNotifyRead,
		PermissionEventsRead,
	}
	for _, permission := range memberReads {
		if !Can(RoleMember, permission) {
			t.Fatalf("Can(%q, %q) = false, want true", RoleMember, permission)
		}
	}
	memberWrites := []Permission{
		PermissionVerifySend,
		PermissionVerifyCheck,
		PermissionVerifyManage,
		PermissionInboxWrite,
		PermissionNotifyExecute,
		PermissionNotifyManage,
		PermissionEventsManage,
		PermissionEventsReplay,
	}
	for _, permission := range memberWrites {
		if Can(RoleMember, permission) {
			t.Fatalf("Can(%q, %q) = true, want false", RoleMember, permission)
		}
	}
}
