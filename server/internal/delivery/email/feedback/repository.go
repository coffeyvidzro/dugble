package feedback

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	awsses "github.com/coffeyvidzro/dugble/server/internal/integration/aws/ses"
	awssns "github.com/coffeyvidzro/dugble/server/internal/integration/aws/sns"
	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
)

var ErrProviderEventUnlinked = errors.New("email provider event is not linked to a message")

type Repository struct {
	db     *pgxpool.Pool
	outbox *outbox.Repository
	now    func() time.Time
}

type emailTransition struct {
	status       string
	errorCode    *string
	errorMessage *string
	deliveredAt  *time.Time
	failedAt     *time.Time
}

func NewRepository(db *pgxpool.Pool, outboxRepository *outbox.Repository) *Repository {
	return &Repository{db: db, outbox: outboxRepository, now: time.Now}
}

func (r *Repository) Ingest(ctx context.Context, envelope awssns.Envelope) error {
	if r == nil || r.db == nil || r.outbox == nil {
		return errors.New("email feedback repository is not configured")
	}

	providerEvent, err := awsses.ParseFeedbackEvent(envelope.Message)
	if err != nil {
		return err
	}
	normalizedPayload, err := json.Marshal(providerEvent)
	if err != nil {
		return fmt.Errorf("encode normalized SES event: %w", err)
	}

	eventID := uuid.NewSHA1(eventNamespace, []byte(envelope.TopicARN+":"+envelope.MessageID))
	receivedAt := r.currentTime().UTC()

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin email provider event transaction: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	commandTag, err := tx.Exec(ctx, `
		INSERT INTO email_provider_events (
			id,
			email_message_id,
			provider,
			transport,
			provider_notification_id,
			provider_message_id,
			event_type,
			occurred_at,
			received_at,
			normalized_payload,
			provider_payload
		)
		VALUES (
			$1,
			(
				SELECT id
				FROM email_messages
				WHERE provider = $2
				  AND provider_message_id = $3
			),
			$2,
			$4,
			$5,
			$3,
			$6,
			$7,
			$8,
			$9,
			$10
		)
		ON CONFLICT (provider, transport, provider_notification_id) DO NOTHING
	`,
		eventID,
		ProviderSES,
		providerEvent.ProviderMessageID,
		TransportSNS,
		envelope.MessageID,
		providerEvent.EventType,
		providerEvent.OccurredAt,
		receivedAt,
		normalizedPayload,
		providerEvent.Payload,
	)
	if err != nil {
		return fmt.Errorf("insert email provider event: %w", err)
	}
	if commandTag.RowsAffected() == 0 {
		return tx.Commit(ctx)
	}

	outboxPayload, err := encodeProviderEventReference(eventID)
	if err != nil {
		return fmt.Errorf("encode email provider event reference: %w", err)
	}
	if _, err := r.outbox.EnqueueTx(ctx, tx, outbox.Event{
		ID:            eventID,
		Subject:       ProviderEventTopic,
		AggregateType: "email_provider_event",
		AggregateID:   eventID,
		Payload:       outboxPayload,
		Headers: map[string]string{
			"Dugble-Event-Id":            eventID.String(),
			"Dugble-Provider":            ProviderSES,
			"Dugble-Transport":           TransportSNS,
			"AWS-SNS-Message-Id":         envelope.MessageID,
			"AWS-SNS-Topic-Arn":          envelope.TopicARN,
			"Dugble-Provider-Event-Type": providerEvent.EventType,
		},
		AvailableAt: receivedAt,
	}); err != nil {
		return fmt.Errorf("enqueue email provider event: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit email provider event transaction: %w", err)
	}
	return nil
}

func (r *Repository) Process(ctx context.Context, eventID uuid.UUID) error {
	if r == nil || r.db == nil {
		return errors.New("email feedback repository is not configured")
	}
	if eventID == uuid.Nil {
		return errors.New("email provider event ID is required")
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin email feedback transaction: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var emailMessageID *uuid.UUID
	var providerMessageID string
	var eventType string
	var occurredAt time.Time
	var processedAt pgtype.Timestamptz
	if err := tx.QueryRow(ctx, `
		SELECT email_message_id, provider_message_id, event_type, occurred_at, processed_at
		FROM email_provider_events
		WHERE id = $1
		  AND provider = $2
		  AND transport = $3
		FOR UPDATE
	`, eventID, ProviderSES, TransportSNS).Scan(
		&emailMessageID,
		&providerMessageID,
		&eventType,
		&occurredAt,
		&processedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("email provider event %s not found", eventID)
		}
		return fmt.Errorf("load email provider event %s: %w", eventID, err)
	}
	if processedAt.Valid {
		return tx.Commit(ctx)
	}

	messageID, currentStatus, err := linkAndLockMessage(ctx, tx, eventID, emailMessageID, providerMessageID)
	if err != nil {
		return err
	}
	transition, apply, err := emailStatusTransition(currentStatus, eventType, occurredAt)
	if err != nil {
		return err
	}
	if apply {
		if _, err := tx.Exec(ctx, `
			UPDATE email_messages
			SET status = $2,
				delivered_at = COALESCE($3, delivered_at),
				failed_at = COALESCE($4, failed_at),
				error_code = $5,
				error_message = $6,
				updated_at = now()
			WHERE id = $1
		`,
			messageID,
			transition.status,
			transition.deliveredAt,
			transition.failedAt,
			transition.errorCode,
			transition.errorMessage,
		); err != nil {
			return fmt.Errorf("apply SES %s status to email %s: %w", eventType, messageID, err)
		}
	}

	if _, err := tx.Exec(ctx, `
		UPDATE email_provider_events
		SET processed_at = COALESCE(processed_at, now())
		WHERE id = $1
	`, eventID); err != nil {
		return fmt.Errorf("mark email provider event %s processed: %w", eventID, err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit email feedback transaction: %w", err)
	}
	return nil
}

func linkAndLockMessage(
	ctx context.Context,
	tx pgx.Tx,
	eventID uuid.UUID,
	emailMessageID *uuid.UUID,
	providerMessageID string,
) (uuid.UUID, string, error) {
	var messageID uuid.UUID
	var currentStatus string

	if emailMessageID != nil {
		err := tx.QueryRow(ctx, `
			SELECT id, status
			FROM email_messages
			WHERE id = $1
			FOR UPDATE
		`, *emailMessageID).Scan(&messageID, &currentStatus)
		if err == nil {
			return messageID, currentStatus, nil
		}
		if !errors.Is(err, pgx.ErrNoRows) {
			return uuid.Nil, "", fmt.Errorf("lock email message %s: %w", *emailMessageID, err)
		}
	}

	err := tx.QueryRow(ctx, `
		SELECT id, status
		FROM email_messages
		WHERE provider = $1
		  AND provider_message_id = $2
		FOR UPDATE
	`, ProviderSES, strings.TrimSpace(providerMessageID)).Scan(&messageID, &currentStatus)
	if errors.Is(err, pgx.ErrNoRows) {
		return uuid.Nil, "", fmt.Errorf("%w: provider message %q", ErrProviderEventUnlinked, providerMessageID)
	}
	if err != nil {
		return uuid.Nil, "", fmt.Errorf("find email by provider message %q: %w", providerMessageID, err)
	}
	if _, err := tx.Exec(ctx, `
		UPDATE email_provider_events
		SET email_message_id = $2
		WHERE id = $1
		  AND email_message_id IS NULL
	`, eventID, messageID); err != nil {
		return uuid.Nil, "", fmt.Errorf("link email provider event %s: %w", eventID, err)
	}
	return messageID, currentStatus, nil
}

func emailStatusTransition(currentStatus string, eventType string, occurredAt time.Time) (emailTransition, bool, error) {
	currentStatus = strings.TrimSpace(currentStatus)
	eventType = strings.TrimSpace(eventType)
	occurredAt = occurredAt.UTC()

	transition := emailTransition{}
	providerError := func(code string, message string) {
		transition.errorCode = &code
		transition.errorMessage = &message
	}

	switch eventType {
	case "send":
		if !statusIn(currentStatus, "queued", "processing", "submitted") {
			return emailTransition{}, false, nil
		}
		transition.status = "submitted"
	case "delivery_delay":
		if !statusIn(currentStatus, "submitted", "delayed") {
			return emailTransition{}, false, nil
		}
		transition.status = "delayed"
		providerError("ses_delivery_delay", "SES reported a delivery delay")
	case "delivery":
		if !statusIn(currentStatus, "submitted", "delayed", "delivered") {
			return emailTransition{}, false, nil
		}
		transition.status = "delivered"
		transition.deliveredAt = &occurredAt
	case "bounce":
		if !statusIn(currentStatus, "submitted", "delayed", "delivered", "bounced") {
			return emailTransition{}, false, nil
		}
		transition.status = "bounced"
		transition.failedAt = &occurredAt
		providerError("ses_bounce", "SES reported a bounce")
	case "complaint":
		if !statusIn(currentStatus, "submitted", "delayed", "delivered", "bounced", "complained") {
			return emailTransition{}, false, nil
		}
		transition.status = "complained"
		transition.failedAt = &occurredAt
		providerError("ses_complaint", "SES reported a complaint")
	case "reject":
		if !statusIn(currentStatus, "processing", "submitted", "delayed", "rejected") {
			return emailTransition{}, false, nil
		}
		transition.status = "rejected"
		transition.failedAt = &occurredAt
		providerError("ses_reject", "SES rejected the message")
	case "rendering_failure":
		if !statusIn(currentStatus, "processing", "submitted", "delayed", "failed") {
			return emailTransition{}, false, nil
		}
		transition.status = "failed"
		transition.failedAt = &occurredAt
		providerError("ses_rendering_failure", "SES could not render the message")
	default:
		return emailTransition{}, false, fmt.Errorf("unsupported persisted SES event type %q", eventType)
	}
	return transition, true, nil
}

func statusIn(current string, allowed ...string) bool {
	for _, status := range allowed {
		if current == status {
			return true
		}
	}
	return false
}

func (r *Repository) currentTime() time.Time {
	if r != nil && r.now != nil {
		return r.now()
	}
	return time.Now()
}
