package scim

import (
	"context"
	db "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"time"
)

type Repository struct{ q *db.Queries }

func NewRepository(p *pgxpool.Pool) *Repository { return &Repository{db.New(p)} }
func (r *Repository) CreateToken(c context.Context, team, actor uuid.UUID, name, hash string, expiry *time.Time) (db.ScimToken, error) {
	var e pgtype.Timestamptz
	if expiry != nil {
		e = pgtype.Timestamptz{Time: *expiry, Valid: true}
	}
	return r.q.CreateSCIMToken(c, db.CreateSCIMTokenParams{TeamID: team, CreatedBy: &actor, Name: name, TokenHash: hash, ExpiresAt: e})
}
func (r *Repository) ListTokens(c context.Context, team uuid.UUID) ([]db.ScimToken, error) {
	return r.q.ListSCIMTokens(c, db.ListSCIMTokensParams{TeamID: team})
}
func (r *Repository) RevokeToken(c context.Context, team, id uuid.UUID) error {
	return r.q.RevokeSCIMToken(c, db.RevokeSCIMTokenParams{TeamID: team, ID: id})
}
func (r *Repository) Authenticate(c context.Context, hash string) (db.ScimToken, error) {
	v, e := r.q.GetActiveSCIMTokenByHash(c, db.GetActiveSCIMTokenByHashParams{TokenHash: hash})
	if e == nil {
		_ = r.q.TouchSCIMToken(c, db.TouchSCIMTokenParams{ID: v.ID})
	}
	return v, e
}
func (r *Repository) ListUsers(c context.Context, team uuid.UUID, email *string, start, count int32) ([]db.ListSCIMUsersRow, int64, error) {
	rows, e := r.q.ListSCIMUsers(c, db.ListSCIMUsersParams{TeamID: team, Email: email, PageSize: count, PageOffset: start - 1})
	if e != nil {
		return nil, 0, e
	}
	total, e := r.q.CountSCIMUsers(c, db.CountSCIMUsersParams{TeamID: team, Email: email})
	return rows, total, e
}
func (r *Repository) GetUser(c context.Context, team, user uuid.UUID) (db.GetSCIMUserRow, error) {
	return r.q.GetSCIMUser(c, db.GetSCIMUserParams{TeamID: team, UserID: user})
}
func (r *Repository) Provision(c context.Context, team uuid.UUID, email, name, external string) (db.User, error) {
	return r.q.ProvisionSCIMUser(c, db.ProvisionSCIMUserParams{TeamID: team, Email: email, Name: name, ExternalID: external})
}
func (r *Repository) Update(c context.Context, team, user uuid.UUID, name, status string) error {
	return r.q.UpdateSCIMUser(c, db.UpdateSCIMUserParams{TeamID: team, UserID: user, Name: name, Status: status})
}
func (r *Repository) Deprovision(c context.Context, team, user uuid.UUID) error {
	return r.q.DeprovisionSCIMUser(c, db.DeprovisionSCIMUserParams{TeamID: team, UserID: user})
}
