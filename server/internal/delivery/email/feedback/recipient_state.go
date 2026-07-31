package feedback

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	awsses "github.com/coffeyvidzro/dugble/server/internal/integration/aws/ses"
)

const (
	recipientStatusPending    = "pending"
	recipientStatusSubmitted  = "submitted"
	recipientStatusDelayed    = "delayed"
	recipientStatusDelivered  = "delivered"
	recipientStatusBounced    = "bounced"
	recipientStatusComplained = "complained"
	recipientStatusRejected   = "rejected"
	recipientStatusFailed     = "failed"
)

type recipientTransition struct {
	status       string
	errorCode    *string
	errorMessage *string
	deliveredAt  *time.Time
	failedAt     *time.Time
}

type aggregateTransition struct {
	status       string
	errorCode    *string
	errorMessage *string
	deliveredAt  *time.Time
	failedAt     *time.Time
}

func applyRecipientCurrentState(
	ctx context.Context,
	tx pgx.Tx,
	messageID uuid.UUID,
	event awsses.FeedbackEvent,
) error {
	for _, recipientEmail := range normalizedRecipients(event.Recipients) {
		var currentStatus string
		var lastEventAt *time.Time
		err := tx.QueryRow(ctx, `
			SELECT status, last_event_at
			FROM email_recipients
			WHERE email_message_id = $1
			  AND recipient_email = $2
			FOR UPDATE
		`, messageID, recipientEmail).Scan(&currentStatus, &lastEventAt)
		if errors.Is(err, pgx.ErrNoRows) {
			if _, err := tx.Exec(ctx, `
				INSERT INTO email_recipients (
					id, email_message_id, recipient_email, recipient_type, status
				)
				VALUES ($1, $2, $3, 'unknown', 'pending')
				ON CONFLICT (email_message_id, recipient_email) DO NOTHING
			`, uuid.New(), messageID, recipientEmail); err != nil {
				return fmt.Errorf("create current state for recipient %q: %w", recipientEmail, err)
			}
			currentStatus = recipientStatusPending
			lastEventAt = nil
		} else if err != nil {
			return fmt.Errorf("lock current state for recipient %q: %w", recipientEmail, err)
		}

		occurredAt := event.OccurredAt.UTC()
		if lastEventAt != nil && occurredAt.Before(lastEventAt.UTC()) {
			continue
		}
		transition, apply, err := recipientStatusTransition(currentStatus, event.EventType, occurredAt)
		if err != nil {
			return err
		}
		if !apply {
			continue
		}
		if _, err := tx.Exec(ctx, `
			UPDATE email_recipients
			SET status = $3,
				last_event_type = $4,
				last_event_at = $5,
				delivered_at = COALESCE($6, delivered_at),
				failed_at = COALESCE($7, failed_at),
				error_code = $8,
				error_message = $9,
				updated_at = now()
			WHERE email_message_id = $1
			  AND recipient_email = $2
		`,
			messageID,
			recipientEmail,
			transition.status,
			event.EventType,
			occurredAt,
			transition.deliveredAt,
			transition.failedAt,
			transition.errorCode,
			transition.errorMessage,
		); err != nil {
			return fmt.Errorf("apply %s state to recipient %q: %w", event.EventType, recipientEmail, err)
		}
	}
	return nil
}

func recipientStatusTransition(currentStatus, eventType string, occurredAt time.Time) (recipientTransition, bool, error) {
	currentStatus = strings.TrimSpace(currentStatus)
	eventType = strings.TrimSpace(eventType)
	occurredAt = occurredAt.UTC()

	transition := recipientTransition{}
	providerError := func(code, message string) {
		transition.errorCode = &code
		transition.errorMessage = &message
		transition.failedAt = &occurredAt
	}

	switch eventType {
	case "send":
		if !recipientStatusIn(currentStatus, recipientStatusPending, recipientStatusSubmitted) {
			return recipientTransition{}, false, nil
		}
		transition.status = recipientStatusSubmitted
	case "delivery_delay":
		if !recipientStatusIn(currentStatus, recipientStatusPending, recipientStatusSubmitted, recipientStatusDelayed) {
			return recipientTransition{}, false, nil
		}
		transition.status = recipientStatusDelayed
		transition.errorCode = stringPointer("ses_delivery_delay")
		transition.errorMessage = stringPointer("SES reported a delivery delay")
	case "delivery":
		if !recipientStatusIn(currentStatus, recipientStatusPending, recipientStatusSubmitted, recipientStatusDelayed, recipientStatusDelivered) {
			return recipientTransition{}, false, nil
		}
		transition.status = recipientStatusDelivered
		transition.deliveredAt = &occurredAt
	case "bounce":
		if !recipientStatusIn(currentStatus, recipientStatusPending, recipientStatusSubmitted, recipientStatusDelayed, recipientStatusDelivered, recipientStatusBounced) {
			return recipientTransition{}, false, nil
		}
		transition.status = recipientStatusBounced
		providerError("ses_bounce", "SES reported a bounce")
	case "complaint":
		if currentStatus == recipientStatusComplained {
			transition.status = recipientStatusComplained
			providerError("ses_complaint", "SES reported a complaint")
			return transition, true, nil
		}
		if !recipientStatusIn(currentStatus, recipientStatusPending, recipientStatusSubmitted, recipientStatusDelayed, recipientStatusDelivered, recipientStatusBounced) {
			return recipientTransition{}, false, nil
		}
		transition.status = recipientStatusComplained
		providerError("ses_complaint", "SES reported a complaint")
	case "reject":
		if !recipientStatusIn(currentStatus, recipientStatusPending, recipientStatusSubmitted, recipientStatusDelayed, recipientStatusRejected) {
			return recipientTransition{}, false, nil
		}
		transition.status = recipientStatusRejected
		providerError("ses_reject", "SES rejected the message")
	case "rendering_failure":
		if !recipientStatusIn(currentStatus, recipientStatusPending, recipientStatusSubmitted, recipientStatusDelayed, recipientStatusFailed) {
			return recipientTransition{}, false, nil
		}
		transition.status = recipientStatusFailed
		providerError("ses_rendering_failure", "SES could not render the message")
	default:
		return recipientTransition{}, false, fmt.Errorf("unsupported persisted SES event type %q", eventType)
	}
	return transition, true, nil
}

func aggregateRecipientMessageStatus(ctx context.Context, tx pgx.Tx, messageID uuid.UUID, fallbackStatus string) (aggregateTransition, error) {
	rows, err := tx.Query(ctx, `
		SELECT status, delivered_at, failed_at
		FROM email_recipients
		WHERE email_message_id = $1
		FOR SHARE
	`, messageID)
	if err != nil {
		return aggregateTransition{}, fmt.Errorf("load recipient states for email %s: %w", messageID, err)
	}
	defer rows.Close()

	counts := map[string]int{}
	var total int
	var latestDeliveredAt *time.Time
	var latestFailedAt *time.Time
	for rows.Next() {
		var status string
		var deliveredAt, failedAt *time.Time
		if err := rows.Scan(&status, &deliveredAt, &failedAt); err != nil {
			return aggregateTransition{}, fmt.Errorf("scan recipient state for email %s: %w", messageID, err)
		}
		counts[status]++
		total++
		latestDeliveredAt = laterTime(latestDeliveredAt, deliveredAt)
		latestFailedAt = laterTime(latestFailedAt, failedAt)
	}
	if err := rows.Err(); err != nil {
		return aggregateTransition{}, fmt.Errorf("iterate recipient states for email %s: %w", messageID, err)
	}
	if total == 0 {
		return aggregateTransition{status: fallbackStatus}, nil
	}

	delivered := counts[recipientStatusDelivered]
	complained := counts[recipientStatusComplained]
	bounced := counts[recipientStatusBounced]
	rejected := counts[recipientStatusRejected]
	failed := counts[recipientStatusFailed]
	terminalFailures := complained + bounced + rejected + failed

	transition := aggregateTransition{deliveredAt: latestDeliveredAt, failedAt: latestFailedAt}
	switch {
	case complained > 0:
		transition.status = "complained"
		transition.errorCode = stringPointer("ses_complaint")
		transition.errorMessage = stringPointer("SES reported a complaint for at least one recipient")
	case delivered == total:
		transition.status = "delivered"
		transition.errorCode = nil
		transition.errorMessage = nil
		transition.failedAt = nil
	case delivered > 0:
		transition.status = "partially_delivered"
		if terminalFailures > 0 {
			transition.errorCode = stringPointer("email_partial_delivery")
			transition.errorMessage = stringPointer("The email was delivered to only some recipients")
		}
	case terminalFailures == total:
		switch {
		case bounced == total:
			transition.status = "bounced"
			transition.errorCode = stringPointer("ses_bounce")
			transition.errorMessage = stringPointer("SES reported a bounce for every recipient")
		case rejected == total:
			transition.status = "rejected"
			transition.errorCode = stringPointer("ses_reject")
			transition.errorMessage = stringPointer("SES rejected every recipient")
		case failed == total:
			transition.status = "failed"
			transition.errorCode = stringPointer("ses_rendering_failure")
			transition.errorMessage = stringPointer("SES could not process the email for any recipient")
		default:
			transition.status = "partially_failed"
			transition.errorCode = stringPointer("email_mixed_recipient_failures")
			transition.errorMessage = stringPointer("Recipients ended in different failure states")
		}
	case terminalFailures > 0:
		transition.status = "partially_failed"
		transition.errorCode = stringPointer("email_partial_failure")
		transition.errorMessage = stringPointer("At least one recipient failed while others remain unresolved")
	case counts[recipientStatusDelayed] > 0:
		transition.status = "delayed"
		transition.errorCode = stringPointer("ses_delivery_delay")
		transition.errorMessage = stringPointer("SES reported a delivery delay for at least one recipient")
	case counts[recipientStatusSubmitted] > 0:
		transition.status = "submitted"
	default:
		transition.status = fallbackStatus
	}
	return transition, nil
}

func recipientStatusIn(current string, allowed ...string) bool {
	for _, status := range allowed {
		if current == status {
			return true
		}
	}
	return false
}

func stringPointer(value string) *string { return &value }

func laterTime(current, candidate *time.Time) *time.Time {
	if candidate == nil {
		return current
	}
	candidateUTC := candidate.UTC()
	if current == nil || candidateUTC.After(current.UTC()) {
		return &candidateUTC
	}
	return current
}
