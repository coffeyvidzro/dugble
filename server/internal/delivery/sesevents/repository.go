package sesevents

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrProviderEventNotFound = errors.New("email provider event not found")

type eventStore interface {
	Exec(context.Context, string, ...any) (pgconn.CommandTag, error)
	QueryRow(context.Context, string, ...any) pgx.Row
}

type Repository struct{ db eventStore }

type ProviderEventRecord struct {
	ID                     uuid.UUID
	EmailMessageID         *uuid.UUID
	Provider               string
	Transport              string
	ProviderNotificationID string
	ProviderMessageID      string
	EventType              EventType
	OccurredAt             time.Time
	ReceivedAt             time.Time
	NormalizedPayload      json.RawMessage
	ProviderPayload        json.RawMessage
	ProcessedAt            *time.Time
	CreatedAt              time.Time
}

func NewRepository(db *pgxpool.Pool) *Repository {
	if db == nil {
		return &Repository{}
	}
	return &Repository{db: db}
}

// Store persists an inbound provider event idempotently and links it to an email
// whenever the SES provider message ID is already known.
func (r *Repository) Store(ctx context.Context, envelope Event, event ProviderEvent) (ProviderEventRecord, bool, error) {
	if r == nil || r.db == nil {
		return ProviderEventRecord{}, false, errors.New("SES event repository is not configured")
	}
	if err := validateStoredEvent(envelope, event); err != nil {
		return ProviderEventRecord{}, false, err
	}
	normalized, err := json.Marshal(event)
	if err != nil {
		return ProviderEventRecord{}, false, fmt.Errorf("encode normalized SES event: %w", err)
	}
	providerPayload := json.RawMessage(envelope.Payload)
	if !json.Valid(providerPayload) {
		return ProviderEventRecord{}, false, errors.New("SES provider payload is not valid JSON")
	}

	commandTag, err := r.db.Exec(ctx, `
		INSERT INTO email_provider_events (
			id, email_message_id, provider, transport, provider_notification_id,
			provider_message_id, event_type, occurred_at, received_at,
			normalized_payload, provider_payload
		)
		VALUES (
			$1,
			(SELECT id FROM email_messages WHERE provider = 'ses' AND provider_message_id = $5),
			$2, $3, $4, $5, $6, $7, $8, $9, $10
		)
		ON CONFLICT (provider, transport, provider_notification_id) DO NOTHING
	`, envelope.EventID, envelope.Provider, envelope.Transport, envelope.ProviderNotificationID,
		event.ProviderMessageID, event.Type, event.OccurredAt, envelope.ReceivedAt, normalized, providerPayload)
	if err != nil {
		return ProviderEventRecord{}, false, fmt.Errorf("insert SES provider event: %w", err)
	}
	created := commandTag.RowsAffected() == 1
	if !created {
		if _, err := r.db.Exec(ctx, `
			UPDATE email_provider_events AS event
			SET email_message_id = message.id
			FROM email_messages AS message
			WHERE event.provider = $1
			  AND event.transport = $2
			  AND event.provider_notification_id = $3
			  AND event.email_message_id IS NULL
			  AND message.provider = 'ses'
			  AND message.provider_message_id = event.provider_message_id
		`, envelope.Provider, envelope.Transport, envelope.ProviderNotificationID); err != nil {
			return ProviderEventRecord{}, false, fmt.Errorf("link SES provider event to email: %w", err)
		}
	}
	record, err := r.getByNotification(ctx, envelope.Provider, envelope.Transport, envelope.ProviderNotificationID)
	if err != nil {
		return ProviderEventRecord{}, false, err
	}
	return record, created, nil
}

func (r *Repository) MarkProcessed(ctx context.Context, id uuid.UUID, processedAt time.Time) error {
	if r == nil || r.db == nil {
		return errors.New("SES event repository is not configured")
	}
	if id == uuid.Nil || processedAt.IsZero() {
		return errors.New("SES provider event ID and processed time are required")
	}
	tag, err := r.db.Exec(ctx, `
		UPDATE email_provider_events
		SET processed_at = COALESCE(processed_at, $2)
		WHERE id = $1
	`, id, processedAt.UTC())
	if err != nil {
		return fmt.Errorf("mark SES provider event processed: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrProviderEventNotFound
	}
	return nil
}

func (r *Repository) getByNotification(ctx context.Context, provider, transport, notificationID string) (ProviderEventRecord, error) {
	var record ProviderEventRecord
	var eventType string
	err := r.db.QueryRow(ctx, `
		SELECT id, email_message_id, provider, transport, provider_notification_id,
			provider_message_id, event_type, occurred_at, received_at,
			normalized_payload, provider_payload, processed_at, created_at
		FROM email_provider_events
		WHERE provider = $1 AND transport = $2 AND provider_notification_id = $3
	`, provider, transport, notificationID).Scan(
		&record.ID, &record.EmailMessageID, &record.Provider, &record.Transport,
		&record.ProviderNotificationID, &record.ProviderMessageID, &eventType,
		&record.OccurredAt, &record.ReceivedAt, &record.NormalizedPayload,
		&record.ProviderPayload, &record.ProcessedAt, &record.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return ProviderEventRecord{}, ErrProviderEventNotFound
	}
	if err != nil {
		return ProviderEventRecord{}, fmt.Errorf("get SES provider event: %w", err)
	}
	record.EventType = EventType(eventType)
	return record, nil
}

func validateStoredEvent(envelope Event, event ProviderEvent) error {
	if envelope.EventID == uuid.Nil || strings.TrimSpace(envelope.ProviderNotificationID) == "" {
		return errors.New("SES event envelope ID and provider notification ID are required")
	}
	if strings.TrimSpace(envelope.Provider) == "" || strings.TrimSpace(envelope.Transport) == "" {
		return errors.New("SES event provider and transport are required")
	}
	if envelope.ReceivedAt.IsZero() || strings.TrimSpace(event.ProviderMessageID) == "" || event.OccurredAt.IsZero() {
		return errors.New("SES event message ID and timestamps are required")
	}
	switch event.Type {
	case EventTypeSend, EventTypeDelivery, EventTypeDeliveryDelay, EventTypeBounce,
		EventTypeComplaint, EventTypeReject, EventTypeRenderingFailure:
		return nil
	default:
		return fmt.Errorf("%w: %q", ErrUnsupportedEventType, event.Type)
	}
}
