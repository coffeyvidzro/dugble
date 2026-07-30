package identitypolicy

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type Repository struct{ queries *dbsqlc.Queries }

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{queries: dbsqlc.New(db)} }

func (r *Repository) Get(ctx context.Context, teamID uuid.UUID) (Policy, error) {
	row, err := r.queries.GetTeamIdentityPolicy(ctx, dbsqlc.GetTeamIdentityPolicyParams{TeamID: teamID})
	if err != nil {
		return Policy{}, fmt.Errorf("get team identity policy: %w", err)
	}
	return Policy{TeamID: row.TeamID.String(), RequireMFA: row.RequireMfa, SessionMaxAgeMinutes: row.SessionMaxAgeMinutes, UpdatedBy: uuidString(row.UpdatedBy), CreatedAt: row.CreatedAt.Time, UpdatedAt: row.UpdatedAt.Time}, nil
}

func (r *Repository) Update(ctx context.Context, teamID, actorID uuid.UUID, request UpdateRequest) (Policy, error) {
	row, err := r.queries.UpsertTeamIdentityPolicy(ctx, dbsqlc.UpsertTeamIdentityPolicyParams{TeamID: teamID, RequireMfa: request.RequireMFA, SessionMaxAgeMinutes: request.SessionMaxAgeMinutes, UpdatedBy: &actorID})
	if err != nil {
		return Policy{}, fmt.Errorf("update team identity policy: %w", err)
	}
	return Policy{TeamID: row.TeamID.String(), RequireMFA: row.RequireMfa, SessionMaxAgeMinutes: row.SessionMaxAgeMinutes, UpdatedBy: uuidString(row.UpdatedBy), CreatedAt: row.CreatedAt.Time, UpdatedAt: row.UpdatedAt.Time}, nil
}

func (r *Repository) GetTenantIdentityPolicy(ctx context.Context, teamID uuid.UUID) (tenant.IdentityPolicy, error) {
	policy, err := r.Get(ctx, teamID)
	if err != nil {
		return tenant.IdentityPolicy{}, err
	}
	return tenant.IdentityPolicy{RequireMFA: policy.RequireMFA, SessionMaxAge: time.Duration(policy.SessionMaxAgeMinutes) * time.Minute}, nil
}

func uuidString(value *uuid.UUID) *string {
	if value == nil {
		return nil
	}
	result := value.String()
	return &result
}
