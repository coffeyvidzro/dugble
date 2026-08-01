package domain

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// Disable marks a sender domain unusable before its provider identity is
// removed. This immediately prevents new sends and causes queued sends to fail
// closed without losing the historical domain reference.
func (r *Repository) Disable(ctx context.Context, id, teamID uuid.UUID) (SenderDomain, error) {
	if r == nil || r.db == nil {
		return SenderDomain{}, errors.New("sender domain repository is not configured")
	}
	commandTag, err := r.db.Exec(ctx, `
		UPDATE sender_domains
		SET status = 'disabled',
			disabled_at = COALESCE(disabled_at, now()),
			next_check_at = now(),
			reconcile_locked_at = NULL,
			reconcile_locked_by = NULL,
			updated_at = now()
		WHERE id = $1 AND team_id = $2
	`, id, teamID)
	if err != nil {
		return SenderDomain{}, fmt.Errorf("disable sender domain: %w", err)
	}
	if commandTag.RowsAffected() == 0 {
		return SenderDomain{}, pgx.ErrNoRows
	}
	return r.Get(ctx, id, teamID)
}

// PurgeIfUnreferenced removes a disabled domain only when no email message
// still references it. Keeping referenced rows preserves delivery authorization
// history and prevents ON DELETE SET NULL from making queued messages appear to
// be platform-owned sends.
func (r *Repository) PurgeIfUnreferenced(ctx context.Context, id, teamID uuid.UUID) (bool, error) {
	if r == nil || r.db == nil {
		return false, errors.New("sender domain repository is not configured")
	}
	commandTag, err := r.db.Exec(ctx, `
		DELETE FROM sender_domains AS domain
		WHERE domain.id = $1
		  AND domain.team_id = $2
		  AND domain.status = 'disabled'
		  AND NOT EXISTS (
			SELECT 1
			FROM email_messages AS message
			WHERE message.sender_domain_id = domain.id
		  )
	`, id, teamID)
	if err != nil {
		return false, fmt.Errorf("purge sender domain: %w", err)
	}
	return commandTag.RowsAffected() > 0, nil
}
