package sso

import (
	"context"

	db "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct{ q *db.Queries }

func NewRepository(pool *pgxpool.Pool) *Repository { return &Repository{db.New(pool)} }
func (r *Repository) Upsert(ctx context.Context, team, actor uuid.UUID, in UpsertRequest, secret []byte) (db.OidcConnection, error) {
	return r.q.UpsertOIDCConnection(ctx, db.UpsertOIDCConnectionParams{TeamID: team, Name: in.Name, IssuerUrl: in.IssuerURL, ClientID: in.ClientID, ClientSecretCiphertext: secret, AllowedDomains: in.AllowedDomains, Enabled: in.Enabled == nil || *in.Enabled, CreatedBy: &actor})
}
func (r *Repository) RotateSecretCiphertext(ctx context.Context, id uuid.UUID, oldCiphertext, newCiphertext []byte) error {
	return r.q.RotateOIDCConnectionSecretCiphertext(ctx, db.RotateOIDCConnectionSecretCiphertextParams{ID: id, OldCiphertext: oldCiphertext, NewCiphertext: newCiphertext})
}

func (r *Repository) GetByTeam(ctx context.Context, id uuid.UUID) (db.OidcConnection, error) {
	return r.q.GetOIDCConnectionByTeam(ctx, db.GetOIDCConnectionByTeamParams{TeamID: id})
}
func (r *Repository) Get(ctx context.Context, id uuid.UUID) (db.OidcConnection, error) {
	return r.q.GetOIDCConnection(ctx, db.GetOIDCConnectionParams{ID: id})
}
func (r *Repository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.q.DeleteOIDCConnection(ctx, db.DeleteOIDCConnectionParams{TeamID: id})
}
func (r *Repository) CreateState(ctx context.Context, hash string, id uuid.UUID, verifier []byte, nonce string, expiry pgtype.Timestamptz) error {
	return r.q.CreateOIDCLoginState(ctx, db.CreateOIDCLoginStateParams{StateHash: hash, ConnectionID: id, CodeVerifierCiphertext: verifier, Nonce: nonce, ExpiresAt: expiry})
}
func (r *Repository) ConsumeState(ctx context.Context, hash string) (db.OidcLoginState, error) {
	return r.q.ConsumeOIDCLoginState(ctx, db.ConsumeOIDCLoginStateParams{StateHash: hash})
}
func (r *Repository) Resolve(ctx context.Context, connection, team uuid.UUID, subject, email, name string) (db.User, error) {
	return r.q.ResolveOIDCIdentity(ctx, db.ResolveOIDCIdentityParams{ConnectionID: connection, TeamID: team, Subject: subject, Email: email, Name: name})
}
