package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/coffeyvidzro/dugble/server/internal/platform/authnz"
)

type UserRecord struct {
	ID            uuid.UUID
	Email         string
	EmailVerified bool
	Name          string
	PasswordHash  *string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type Repository struct {
	queries *dbsqlc.Queries
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{queries: dbsqlc.New(db)}
}

func (r *Repository) CreateUser(
	ctx context.Context,
	name string,
	email string,
	passwordHash string,
) (UserRecord, error) {
	row, err := r.queries.CreateUser(
		ctx,
		dbsqlc.CreateUserParams{Name: name, Email: email, PasswordHash: &passwordHash},
	)
	if err != nil {
		return UserRecord{}, fmt.Errorf("create identity user: %w", err)
	}
	return userRecordFromSQLC(row), nil
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (UserRecord, error) {
	row, err := r.queries.GetUserByEmail(ctx, dbsqlc.GetUserByEmailParams{Email: email})
	if err != nil {
		return UserRecord{}, fmt.Errorf("get identity user by email: %w", err)
	}
	return userRecordFromSQLC(row), nil
}

func (r *Repository) GetUserByID(ctx context.Context, id uuid.UUID) (UserRecord, error) {
	row, err := r.queries.GetUserByID(ctx, dbsqlc.GetUserByIDParams{ID: id})
	if err != nil {
		return UserRecord{}, fmt.Errorf("get identity user by id: %w", err)
	}
	return userRecordFromSQLC(row), nil
}

func (r *Repository) GetPrincipalByUserID(
	ctx context.Context,
	id string,
) (authnz.Principal, error) {
	parsedID, err := uuid.Parse(id)
	if err != nil {
		return authnz.Principal{}, fmt.Errorf("parse principal user id: %w", err)
	}

	user, err := r.GetUserByID(ctx, parsedID)
	if err != nil {
		return authnz.Principal{}, err
	}

	return authnz.Principal{
		UserID:        user.ID,
		Email:         user.Email,
		Name:          user.Name,
		EmailVerified: user.EmailVerified,
	}, nil
}

func (r *Repository) CreateVerificationToken(
	ctx context.Context,
	identifier string,
	tokenHash string,
	expiresAt time.Time,
) error {

	_, err := r.queries.CreateVerificationToken(ctx, dbsqlc.CreateVerificationTokenParams{
		Identifier: identifier,
		TokenHash:  tokenHash,
		ExpiresAt:  pgtype.Timestamptz{Time: expiresAt, Valid: true},
	})
	if err != nil {
		return fmt.Errorf("create verification token: %w", err)
	}
	return nil
}

func (r *Repository) HasVerificationToken(
	ctx context.Context,
	identifier string,
	tokenHash string,
) error {
	_, err := r.queries.GetVerificationToken(
		ctx,
		dbsqlc.GetVerificationTokenParams{Identifier: identifier, TokenHash: tokenHash},
	)
	if err != nil {
		return fmt.Errorf("get verification token: %w", err)
	}
	return nil
}

func (r *Repository) DeleteVerificationToken(
	ctx context.Context,
	identifier string,
	tokenHash string,
) error {
	if err := r.queries.DeleteVerificationToken(
		ctx,
		dbsqlc.DeleteVerificationTokenParams{Identifier: identifier, TokenHash: tokenHash},
	); err != nil {
		return fmt.Errorf("delete verification token: %w", err)
	}
	return nil
}

func (r *Repository) MarkEmailVerified(ctx context.Context, email string) (UserRecord, error) {
	row, err := r.queries.MarkUserEmailVerifiedByEmail(
		ctx,
		dbsqlc.MarkUserEmailVerifiedByEmailParams{Email: email},
	)
	if err != nil {
		return UserRecord{}, fmt.Errorf("mark email verified: %w", err)
	}
	return userRecordFromSQLC(row), nil
}

func (r *Repository) UpdatePasswordByEmail(
	ctx context.Context,
	email string,
	passwordHash string,
) (UserRecord, error) {
	row, err := r.queries.UpdateUserPasswordByEmail(
		ctx,
		dbsqlc.UpdateUserPasswordByEmailParams{Email: email, PasswordHash: &passwordHash},
	)
	if err != nil {
		return UserRecord{}, fmt.Errorf("update password by email: %w", err)
	}
	return userRecordFromSQLC(row), nil
}

func userRecordFromSQLC(row dbsqlc.User) UserRecord {
	return UserRecord{
		ID:            row.ID,
		Email:         row.Email,
		EmailVerified: row.EmailVerified,
		Name:          row.Name,
		PasswordHash:  row.PasswordHash,
		CreatedAt:     row.CreatedAt.Time,
		UpdatedAt:     row.UpdatedAt.Time,
	}
}
