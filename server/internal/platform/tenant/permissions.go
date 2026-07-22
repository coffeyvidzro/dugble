package tenant

type Permission string

const (
	PermissionTeamRead            Permission = "team:read"
	PermissionTeamCreate          Permission = "team:create"
	PermissionTeamUpdate          Permission = "team:update"
	PermissionTeamDelete          Permission = "team:delete"
	PermissionTeamMembersRead     Permission = "team_members:read"
	PermissionTeamMemberLeave     Permission = "team_members:leave"
	PermissionTeamMemberInvite    Permission = "team_members:invite"
	PermissionTeamMemberRemove    Permission = "team_members:remove"
	PermissionTeamMemberRole      Permission = "team_members:role"
	PermissionTeamTokensRead      Permission = "team_tokens:read"
	PermissionTeamTokensCreate    Permission = "team_tokens:create"
	PermissionTeamTokensUpdate    Permission = "team_tokens:update"
	PermissionTeamTokensRevoke    Permission = "team_tokens:revoke"
	PermissionSenderIDsRead       Permission = "sender_ids:read"
	PermissionSenderIDsCreate     Permission = "sender_ids:create"
	PermissionSenderIDsDelete     Permission = "sender_ids:delete"
	PermissionSenderDomainsRead   Permission = "sender_domains:read"
	PermissionSenderDomainsCreate Permission = "sender_domains:create"
	PermissionSenderDomainsDelete Permission = "sender_domains:delete"
)

var permissionsByRole = map[string]map[Permission]struct{}{
	RoleOwner: {
		PermissionTeamRead:            {},
		PermissionTeamCreate:          {},
		PermissionTeamUpdate:          {},
		PermissionTeamDelete:          {},
		PermissionTeamMembersRead:     {},
		PermissionTeamMemberInvite:    {},
		PermissionTeamMemberRemove:    {},
		PermissionTeamMemberRole:      {},
		PermissionTeamTokensRead:      {},
		PermissionTeamTokensCreate:    {},
		PermissionTeamTokensUpdate:    {},
		PermissionTeamTokensRevoke:    {},
		PermissionSenderIDsRead:       {},
		PermissionSenderIDsCreate:     {},
		PermissionSenderIDsDelete:     {},
		PermissionSenderDomainsRead:   {},
		PermissionSenderDomainsCreate: {},
		PermissionSenderDomainsDelete: {},
	},
	RoleAdmin: {
		PermissionTeamRead:            {},
		PermissionTeamCreate:          {},
		PermissionTeamUpdate:          {},
		PermissionTeamMembersRead:     {},
		PermissionTeamMemberLeave:     {},
		PermissionTeamMemberInvite:    {},
		PermissionTeamMemberRemove:    {},
		PermissionTeamTokensRead:      {},
		PermissionTeamTokensCreate:    {},
		PermissionTeamTokensUpdate:    {},
		PermissionTeamTokensRevoke:    {},
		PermissionSenderIDsRead:       {},
		PermissionSenderIDsCreate:     {},
		PermissionSenderIDsDelete:     {},
		PermissionSenderDomainsRead:   {},
		PermissionSenderDomainsCreate: {},
		PermissionSenderDomainsDelete: {},
	},
	RoleMember: {
		PermissionTeamRead:          {},
		PermissionTeamCreate:        {},
		PermissionTeamMembersRead:   {},
		PermissionTeamMemberLeave:   {},
		PermissionSenderIDsRead:     {},
		PermissionSenderDomainsRead: {},
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
