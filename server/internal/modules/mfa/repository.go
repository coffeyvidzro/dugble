package mfa

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Credential struct {
	SecretCiphertext []byte
	VerifiedAt       *time.Time
	LastUsedStep     *int64
}

type Repository struct{ db *pgxpool.Pool }

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db} }

func (r *Repository) PutUnverified(ctx context.Context, userID uuid.UUID, ciphertext []byte) error {
	tag, err := r.db.Exec(ctx, `
		INSERT INTO totp_credentials (user_id, secret_ciphertext)
		VALUES ($1, $2)
		ON CONFLICT (user_id) DO UPDATE SET
			secret_ciphertext = EXCLUDED.secret_ciphertext,
			verified_at = NULL,
			last_used_step = NULL,
			updated_at = now()
		WHERE totp_credentials.verified_at IS NULL`, userID, ciphertext)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *Repository) GetCredential(ctx context.Context, userID uuid.UUID) (Credential, error) {
	var credential Credential
	err := r.db.QueryRow(ctx, `
		SELECT secret_ciphertext, verified_at, last_used_step
		FROM totp_credentials WHERE user_id = $1`, userID).Scan(
		&credential.SecretCiphertext, &credential.VerifiedAt, &credential.LastUsedStep,
	)
	return credential, err
}

func (r *Repository) Confirm(ctx context.Context, userID uuid.UUID, sessionID string, step int64, codeHashes []string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	tag, err := tx.Exec(ctx, `
		UPDATE totp_credentials SET verified_at = now(), last_used_step = $2, updated_at = now()
		WHERE user_id = $1 AND verified_at IS NULL`, userID, step)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return pgx.ErrNoRows
	}
	if _, err = tx.Exec(ctx, `DELETE FROM recovery_codes WHERE user_id = $1`, userID); err != nil {
		return err
	}
	for _, hash := range codeHashes {
		if _, err = tx.Exec(ctx, `INSERT INTO recovery_codes (user_id, code_hash) VALUES ($1, $2)`, userID, hash); err != nil {
			return err
		}
	}
	if _, err = tx.Exec(ctx, `
		UPDATE sessions SET assurance_level = 'aal2', mfa_completed_at = now()
		WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL`, sessionID, userID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *Repository) Verify(ctx context.Context, userID uuid.UUID, sessionID string, step int64) error {
	tag, err := r.db.Exec(ctx, `
		WITH accepted AS (
			UPDATE totp_credentials SET last_used_step = $3, updated_at = now()
			WHERE user_id = $1 AND verified_at IS NOT NULL
			  AND (last_used_step IS NULL OR last_used_step < $3)
			RETURNING user_id
		)
		UPDATE sessions SET assurance_level = 'aal2', mfa_completed_at = now()
		WHERE id = $2 AND user_id = $1 AND revoked_at IS NULL
		  AND EXISTS (SELECT 1 FROM accepted)`, userID, sessionID, step)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *Repository) UseRecoveryCode(ctx context.Context, userID uuid.UUID, sessionID, codeHash string) error {
	tag, err := r.db.Exec(ctx, `
		WITH accepted AS (
			UPDATE recovery_codes SET used_at = now()
			WHERE user_id = $1 AND code_hash = $3 AND used_at IS NULL
			RETURNING user_id
		)
		UPDATE sessions SET authentication_method = 'recovery_code', assurance_level = 'aal2', mfa_completed_at = now()
		WHERE id = $2 AND user_id = $1 AND revoked_at IS NULL
		  AND EXISTS (SELECT 1 FROM accepted)`, userID, sessionID, codeHash)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *Repository) Disable(ctx context.Context, userID uuid.UUID, currentSessionID string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()
	if _, err = tx.Exec(ctx, `DELETE FROM totp_credentials WHERE user_id = $1`, userID); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `DELETE FROM recovery_codes WHERE user_id = $1`, userID); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `UPDATE sessions SET revoked_at = now() WHERE user_id = $1 AND id <> $2 AND revoked_at IS NULL`, userID, currentSessionID); err != nil {
		return err
	}
	if _, err = tx.Exec(ctx, `UPDATE sessions SET authentication_method = 'password', assurance_level = 'aal1', mfa_completed_at = NULL WHERE user_id = $1 AND id = $2`, userID, currentSessionID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (r *Repository) Enabled(ctx context.Context, userID uuid.UUID) (bool, error) {
	var enabled bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM totp_credentials WHERE user_id = $1 AND verified_at IS NOT NULL)`, userID).Scan(&enabled)
	return enabled, err
}
