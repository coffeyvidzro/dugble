package tenant

import (
	"context"

	"github.com/google/uuid"
)

type contextKey struct{}

type ActorType string

const (
	ActorTypeUser      ActorType = "user"
	ActorTypeTeamToken ActorType = "team_token"
)

type Context struct {
	TeamID      uuid.UUID
	ActorType   ActorType
	UserID      uuid.UUID
	Role        string
	Status      string
	TokenID     uuid.UUID
	Permissions []Permission
}

func (c Context) IsUser() bool { return c.ActorType == ActorTypeUser || c.UserID != uuid.Nil }

func (c Context) IsTeamToken() bool {
	return c.ActorType == ActorTypeTeamToken || c.TokenID != uuid.Nil
}

func ContextWithTenant(ctx context.Context, tenantContext Context) context.Context {
	return context.WithValue(ctx, contextKey{}, tenantContext)
}

func FromContext(ctx context.Context) (Context, bool) {
	tenantContext, ok := ctx.Value(contextKey{}).(Context)
	return tenantContext, ok
}
