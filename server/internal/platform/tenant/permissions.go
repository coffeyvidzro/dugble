package tenant

type Permission string

const (
	PermissionTeamRead         Permission = "team:read"
	PermissionTeamCreate       Permission = "team:create"
	PermissionTeamUpdate       Permission = "team:update"
	PermissionTeamDelete       Permission = "team:delete"
	PermissionTeamMembersRead  Permission = "team_members:read"
	PermissionTeamMemberLeave  Permission = "team_members:leave"
	PermissionTeamMemberInvite Permission = "team_members:invite"
	PermissionTeamMemberRemove Permission = "team_members:remove"
	PermissionTeamMemberRole   Permission = "team_members:role"
	PermissionTeamTokensRead   Permission = "team_tokens:read"
	PermissionTeamTokensCreate Permission = "team_tokens:create"
	PermissionTeamTokensUpdate Permission = "team_tokens:update"
	PermissionTeamTokensRevoke Permission = "team_tokens:revoke"
)

var permissionsByRole = map[string]map[Permission]struct{}{
	RoleOwner: {
		PermissionTeamRead:         {},
		PermissionTeamCreate:       {},
		PermissionTeamUpdate:       {},
		PermissionTeamDelete:       {},
		PermissionTeamMembersRead:  {},
		PermissionTeamMemberInvite: {},
		PermissionTeamMemberRemove: {},
		PermissionTeamMemberRole:   {},
		PermissionTeamTokensRead:   {},
		PermissionTeamTokensCreate: {},
		PermissionTeamTokensUpdate: {},
		PermissionTeamTokensRevoke: {},
	},
	RoleAdmin: {
		PermissionTeamRead:         {},
		PermissionTeamCreate:       {},
		PermissionTeamUpdate:       {},
		PermissionTeamMembersRead:  {},
		PermissionTeamMemberLeave:  {},
		PermissionTeamMemberInvite: {},
		PermissionTeamMemberRemove: {},
		PermissionTeamTokensRead:   {},
		PermissionTeamTokensCreate: {},
		PermissionTeamTokensUpdate: {},
		PermissionTeamTokensRevoke: {},
	},
	RoleMember: {
		PermissionTeamRead:        {},
		PermissionTeamCreate:      {},
		PermissionTeamMembersRead: {},
		PermissionTeamMemberLeave: {},
	},
}

func Can(role string, permission Permission) bool {
	permissions, ok := permissionsByRole[role]
	if !ok {
		return false
	}
	_, ok = permissions[permission]
	return ok
}

func HasPermission(permissions []Permission, permission Permission) bool {
	for _, candidate := range permissions {
		if candidate == permission {
			return true
		}
	}
	return false
}

func ContextCan(tenantContext Context, permission Permission) bool {
	if HasPermission(tenantContext.Permissions, permission) {
		return true
	}
	return Can(tenantContext.Role, permission)
}
