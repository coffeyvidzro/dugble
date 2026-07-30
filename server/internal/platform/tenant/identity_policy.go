package tenant

import (
	"context"
	"time"

	"github.com/google/uuid"
)

const DefaultSessionMaxAge = 30 * 24 * time.Hour

type IdentityPolicy struct {
	RequireMFA    bool
	SessionMaxAge time.Duration
}

type IdentityPolicyStore interface {
	GetTenantIdentityPolicy(context.Context, uuid.UUID) (IdentityPolicy, error)
}
