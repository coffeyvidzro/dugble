package workload

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

type Repository struct{ queries *dbsqlc.Queries }

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{queries: dbsqlc.New(db)} }

func (r *Repository) Create(ctx context.Context, teamID uuid.UUID, name, description string, permissions []string, createdBy uuid.UUID) (Identity, error) {
	row, err := r.queries.CreateWorkloadIdentity(ctx, dbsqlc.CreateWorkloadIdentityParams{TeamID: teamID, Name: name, Description: description, Permissions: permissions, CreatedBy: &createdBy})
	return identity(row), err
}
func (r *Repository) List(ctx context.Context, teamID uuid.UUID) ([]Identity, error) {
	rows, err := r.queries.ListWorkloadIdentities(ctx, dbsqlc.ListWorkloadIdentitiesParams{TeamID: teamID})
	if err != nil {
		return nil, err
	}
	out := make([]Identity, 0, len(rows))
	for _, row := range rows {
		out = append(out, identity(row))
	}
	return out, nil
}
func (r *Repository) Update(ctx context.Context, id, teamID uuid.UUID, name, description string, permissions []string) (Identity, error) {
	row, err := r.queries.UpdateWorkloadIdentity(ctx, dbsqlc.UpdateWorkloadIdentityParams{ID: id, TeamID: teamID, Name: name, Description: description, Permissions: permissions})
	return identity(row), err
}
func (r *Repository) Disable(ctx context.Context, id, teamID uuid.UUID) (Identity, error) {
	row, err := r.queries.DisableWorkloadIdentity(ctx, dbsqlc.DisableWorkloadIdentityParams{ID: id, TeamID: teamID})
	return identity(row), err
}
func (r *Repository) CreateCredential(ctx context.Context, workloadID, teamID uuid.UUID, hash, prefix string, expires time.Time) (dbsqlc.WorkloadCredential, error) {
	return r.queries.CreateWorkloadCredential(ctx, dbsqlc.CreateWorkloadCredentialParams{WorkloadID: workloadID, TeamID: teamID, SecretHash: hash, SecretPrefix: prefix, ExpiresAt: pgtype.Timestamptz{Time: expires, Valid: true}})
}
func (r *Repository) RevokeCredential(ctx context.Context, id, workloadID, teamID uuid.UUID) error {
	_, err := r.queries.RevokeWorkloadCredential(ctx, dbsqlc.RevokeWorkloadCredentialParams{ID: id, WorkloadID: workloadID, TeamID: teamID})
	return err
}
func (r *Repository) GetCredential(ctx context.Context, hash string) (CredentialPrincipal, error) {
	row, err := r.queries.GetActiveWorkloadCredentialByHash(ctx, dbsqlc.GetActiveWorkloadCredentialByHashParams{SecretHash: hash})
	return CredentialPrincipal{CredentialID: row.CredentialID.String(), WorkloadID: row.WorkloadID.String(), TeamID: row.TeamID.String(), Name: row.Name, Permissions: row.Permissions}, err
}
func (r *Repository) TouchCredential(ctx context.Context, id uuid.UUID) error {
	return r.queries.TouchWorkloadCredential(ctx, dbsqlc.TouchWorkloadCredentialParams{ID: id})
}
func (r *Repository) CreateAccessToken(ctx context.Context, workloadID, credentialID uuid.UUID, hash string, expires time.Time) error {
	_, err := r.queries.CreateWorkloadAccessToken(ctx, dbsqlc.CreateWorkloadAccessTokenParams{WorkloadID: workloadID, CredentialID: credentialID, TokenHash: hash, ExpiresAt: pgtype.Timestamptz{Time: expires, Valid: true}})
	return err
}
func (r *Repository) GetAccessToken(ctx context.Context, hash string) (TokenPrincipal, error) {
	row, err := r.queries.GetActiveWorkloadAccessTokenByHash(ctx, dbsqlc.GetActiveWorkloadAccessTokenByHashParams{TokenHash: hash})
	return TokenPrincipal{TokenID: row.TokenID.String(), CredentialID: optionalID(row.CredentialID), WorkloadID: row.WorkloadID.String(), TeamID: row.TeamID.String(), Name: row.Name, Permissions: row.Permissions, ExpiresAt: row.ExpiresAt.Time}, err
}
func (r *Repository) TouchAccessToken(ctx context.Context, id uuid.UUID) error {
	return r.queries.TouchWorkloadAccessToken(ctx, dbsqlc.TouchWorkloadAccessTokenParams{ID: id})
}

func identity(row dbsqlc.WorkloadIdentity) Identity {
	return Identity{ID: row.ID.String(), TeamID: row.TeamID.String(), Name: row.Name, Description: row.Description, Status: row.Status, Permissions: row.Permissions, CreatedBy: stringID(row.CreatedBy), CreatedAt: row.CreatedAt.Time, UpdatedAt: row.UpdatedAt.Time, DisabledAt: timeValue(row.DisabledAt)}
}
func stringID(id *uuid.UUID) *string {
	if id == nil {
		return nil
	}
	v := id.String()
	return &v
}
func timeValue(value pgtype.Timestamptz) *time.Time {
	if !value.Valid {
		return nil
	}
	v := value.Time
	return &v
}

func (r *Repository) CreateOIDCFederation(ctx context.Context, workloadID, teamID, actorID uuid.UUID, request OIDCFederationRequest, claims []byte) (dbsqlc.WorkloadOidcFederation, error) {
	enabled := request.Enabled == nil || *request.Enabled
	return r.queries.CreateWorkloadOIDCFederation(ctx, dbsqlc.CreateWorkloadOIDCFederationParams{WorkloadID: workloadID, TeamID: teamID, Name: request.Name, IssuerUrl: request.IssuerURL, Audiences: request.Audiences, Subject: request.Subject, RequiredClaims: claims, Enabled: enabled, CreatedBy: &actorID})
}
func (r *Repository) ListOIDCFederations(ctx context.Context, workloadID, teamID uuid.UUID) ([]dbsqlc.WorkloadOidcFederation, error) {
	return r.queries.ListWorkloadOIDCFederations(ctx, dbsqlc.ListWorkloadOIDCFederationsParams{WorkloadID: workloadID, TeamID: teamID})
}
func (r *Repository) DeleteOIDCFederation(ctx context.Context, id, workloadID, teamID uuid.UUID) error {
	return r.queries.DeleteWorkloadOIDCFederation(ctx, dbsqlc.DeleteWorkloadOIDCFederationParams{ID: id, WorkloadID: workloadID, TeamID: teamID})
}
func (r *Repository) GetOIDCFederation(ctx context.Context, id uuid.UUID) (dbsqlc.GetActiveWorkloadOIDCFederationRow, error) {
	return r.queries.GetActiveWorkloadOIDCFederation(ctx, dbsqlc.GetActiveWorkloadOIDCFederationParams{ID: id})
}
func (r *Repository) CreateFederatedAccessToken(ctx context.Context, workloadID, federationID uuid.UUID, hash string, expires time.Time) error {
	_, err := r.queries.CreateFederatedWorkloadAccessToken(ctx, dbsqlc.CreateFederatedWorkloadAccessTokenParams{WorkloadID: workloadID, FederationID: &federationID, TokenHash: hash, ExpiresAt: pgtype.Timestamptz{Time: expires, Valid: true}})
	return err
}

func optionalID(id *uuid.UUID) string {
	if id == nil {
		return ""
	}
	return id.String()
}
