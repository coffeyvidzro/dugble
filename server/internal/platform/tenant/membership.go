package tenant

import (
	"context"

	"github.com/google/uuid"
)

const (
	RoleOwner  = "owner"
	RoleAdmin  = "admin"
	RoleMember = "member"

	StatusActive    = "active"
	StatusSuspended = "suspended"
	StatusInvited   = "invited"
)

type Membership struct {
	TeamID uuid.UUID
	UserID uuid.UUID
	Role   string
	Status string
}

func (m Membership) Active() bool {
	return m.Status == StatusActive
}

type MembershipStore interface {
	GetTenantMembership(ctx context.Context, teamID uuid.UUID, userID uuid.UUID) (Membership, error)
}
