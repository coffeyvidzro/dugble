package session

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

type Repository struct {
	queries *dbsqlc.Queries
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{queries: dbsqlc.New(db)}
}

func (r *Repository) Create(
	ctx context.Context,
	userID uuid.UUID,
	tokenHash string,
	userAgent *string,
	ipAddress *string,
	expiresAt time.Time,
) (Record, error) {
	created, err := r.queries.CreateSession(ctx, dbsqlc.CreateSessionParams{
		UserID:    userID,
		TokenHash: tokenHash,
		UserAgent: userAgent,
		IpAddress: ipAddress,
		ExpiresAt: pgtype.Timestamptz{Time: expiresAt, Valid: true},
	})
	if err != nil {
		return Record{}, fmt.Errorf("create session: %w", err)
	}
	return recordFromSQLC(created), nil
}

func (r *Repository) GetByTokenHash(ctx context.Context, tokenHash string) (Record, error) {
	row, err := r.queries.GetSessionByTokenHash(
		ctx,
		dbsqlc.GetSessionByTokenHashParams{TokenHash: tokenHash},
	)
	if err != nil {
		return Record{}, fmt.Errorf("get session by token hash: %w", err)
	}
	return recordFromSQLC(row), nil
}

func (r *Repository) ListByUserID(ctx context.Context, userID uuid.UUID) ([]Record, error) {
	rows, err := r.queries.ListSessionsByUserID(
		ctx,
		dbsqlc.ListSessionsByUserIDParams{UserID: userID},
	)
	if err != nil {
		return nil, fmt.Errorf("list sessions by user id: %w", err)
	}

	sessions := make([]Record, 0, len(rows))
	for _, row := range rows {
		sessions = append(sessions, recordFromSQLC(row))
	}

	return sessions, nil
}

func (r *Repository) Revoke(ctx context.Context, userID uuid.UUID, id string) error {
	return r.queries.RevokeSession(ctx, dbsqlc.RevokeSessionParams{ID: id, UserID: userID})
}

func (r *Repository) RevokeOthers(
	ctx context.Context,
	userID uuid.UUID,
	currentSessionID string,
) error {
	return r.queries.RevokeOtherUserSessions(
		ctx,
		dbsqlc.RevokeOtherUserSessionsParams{UserID: userID, CurrentSessionID: currentSessionID},
	)
}

func (r *Repository) RevokeAll(ctx context.Context, userID uuid.UUID) error {
	return r.queries.RevokeUserSessions(ctx, dbsqlc.RevokeUserSessionsParams{UserID: userID})
}

func (r *Repository) Touch(ctx context.Context, id string) error {
	return r.queries.TouchSession(ctx, dbsqlc.TouchSessionParams{ID: id})
}

func recordFromSQLC(row dbsqlc.Session) Record {
	var revokedAt *time.Time
	if row.RevokedAt.Valid {
		revokedAt = &row.RevokedAt.Time
	}

	return Record{
		ID:         row.ID,
		UserID:     row.UserID,
		TokenHash:  row.TokenHash,
		UserAgent:  row.UserAgent,
		IPAddress:  row.IpAddress,
		ExpiresAt:  row.ExpiresAt.Time,
		RevokedAt:  revokedAt,
		CreatedAt:  row.CreatedAt.Time,
		LastSeenAt: row.LastSeenAt.Time,
	}
}
