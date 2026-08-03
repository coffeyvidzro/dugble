package email

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

var (
	ErrSandboxTeamEmailNotVerified = errors.New("sandbox team email is not verified")
	ErrSandboxRecipientRestricted  = errors.New("sandbox recipient is restricted")
)

// AuthorizeSandboxRecipients permits the shared onboarding identity only when
// the message has exactly one direct recipient, no CC/BCC recipients, and that
// address matches both the team's configured email and a verified active owner.
func (r *Repository) AuthorizeSandboxRecipients(
	ctx context.Context,
	teamID uuid.UUID,
	to, cc, bcc []EmailAddress,
) error {
	if len(to) != 1 || len(cc) != 0 || len(bcc) != 0 {
		return ErrSandboxRecipientRestricted
	}

	var teamEmail string
	err := r.db.QueryRow(ctx, `
		SELECT t.email
		FROM teams AS t
		JOIN team_members AS member
		  ON member.team_id = t.id
		 AND member.role = 'owner'
		 AND member.status = 'active'
		JOIN users AS owner
		  ON owner.id = member.user_id
		 AND owner.email_verified = true
		 AND lower(owner.email) = lower(t.email)
		WHERE t.id = $1
		  AND t.status = 'active'
		LIMIT 1
	`, teamID).Scan(&teamEmail)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrSandboxTeamEmailNotVerified
	}
	if err != nil {
		return fmt.Errorf("resolve verified sandbox team email: %w", err)
	}
	if !strings.EqualFold(strings.TrimSpace(to[0].Email), strings.TrimSpace(teamEmail)) {
		return ErrSandboxRecipientRestricted
	}
	return nil
}
