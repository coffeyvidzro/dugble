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
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
	"github.com/coffeyvidzro/dugble/server/pkg/pgconv"
)

var ErrProviderEventNotFound = errors.New("email provider event not found")

type providerEventQueries interface {
	CreateEmailProviderEvent(context.Context, dbsqlc.CreateEmailProviderEventParams) (int64, error)
	LinkEmailProviderEvent(context.Context, dbsqlc.LinkEmailProviderEventParams) (int64, error)
	GetEmailProviderEventByNotification(context.Context, dbsqlc.GetEmailProviderEventByNotificationParams) (dbsqlc.EmailProviderEvent, error)
	MarkEmailProviderEventProcessed(context.Context, dbsqlc.MarkEmailProviderEventProcessedParams) (int64, error)
}

type Repository struct{ queries providerEventQueries }

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
	return &Repository{queries: dbsqlc.New(db)}
}

// Store persists an inbound provider event idempotently and links it to an email
// whenever the SES provider message ID is already known.
func (r *Repository) Store(ctx context.Context, envelope Event, event ProviderEvent) (ProviderEventRecord, bool, error) {
	if r == nil || r.queries == nil {
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

	createdCount, err := r.queries.CreateEmailProviderEvent(ctx, dbsqlc.CreateEmailProviderEventParams{
		ID: envelope.EventID, ProviderMessageID: event.ProviderMessageID,
		Provider: envelope.Provider, Transport: envelope.Transport,
		ProviderNotificationID: envelope.ProviderNotificationID, EventType: string(event.Type),
		OccurredAt:        pgconv.NullableTimestamptz(&event.OccurredAt),
		ReceivedAt:        pgconv.NullableTimestamptz(&envelope.ReceivedAt),
		NormalizedPayload: normalized, ProviderPayload: providerPayload,
	})
	if err != nil {
		return ProviderEventRecord{}, false, fmt.Errorf("insert SES provider event: %w", err)
	}
	created := createdCount == 1
	if !created {
		_, err := r.queries.LinkEmailProviderEvent(ctx, dbsqlc.LinkEmailProviderEventParams{
			Provider: envelope.Provider, Transport: envelope.Transport,
			ProviderNotificationID: envelope.ProviderNotificationID,
		})
		if err != nil {
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
	if r == nil || r.queries == nil {
		return errors.New("SES event repository is not configured")
	}
	if id == uuid.Nil || processedAt.IsZero() {
		return errors.New("SES provider event ID and processed time are required")
	}
	count, err := r.queries.MarkEmailProviderEventProcessed(ctx, dbsqlc.MarkEmailProviderEventProcessedParams{
		ID: id, ProcessedAt: pgconv.NullableTimestamptz(&processedAt),
	})
	if err != nil {
		return fmt.Errorf("mark SES provider event processed: %w", err)
	}
	if count == 0 {
		return ErrProviderEventNotFound
	}
	return nil
}

func (r *Repository) getByNotification(ctx context.Context, provider, transport, notificationID string) (ProviderEventRecord, error) {
	row, err := r.queries.GetEmailProviderEventByNotification(ctx, dbsqlc.GetEmailProviderEventByNotificationParams{
		Provider: provider, Transport: transport, ProviderNotificationID: notificationID,
	})
	if errors.Is(err, pgx.ErrNoRows) {
		return ProviderEventRecord{}, ErrProviderEventNotFound
	}
	if err != nil {
		return ProviderEventRecord{}, fmt.Errorf("get SES provider event: %w", err)
	}
	var processedAt *time.Time
	if row.ProcessedAt.Valid {
		value := row.ProcessedAt.Time.UTC()
		processedAt = &value
	}
	return ProviderEventRecord{
		ID: row.ID, EmailMessageID: row.EmailMessageID, Provider: row.Provider, Transport: row.Transport,
		ProviderNotificationID: row.ProviderNotificationID, ProviderMessageID: row.ProviderMessageID,
		EventType: EventType(row.EventType), OccurredAt: pgconv.TimestamptzToTime(row.OccurredAt),
		ReceivedAt: pgconv.TimestamptzToTime(row.ReceivedAt), NormalizedPayload: json.RawMessage(row.NormalizedPayload),
		ProviderPayload: json.RawMessage(row.ProviderPayload), ProcessedAt: processedAt,
		CreatedAt: pgconv.TimestamptzToTime(row.CreatedAt),
	}, nil
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
