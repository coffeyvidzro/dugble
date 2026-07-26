package webhooks

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrEndpointNotFound = errors.New("webhook endpoint not found")
	ErrEventNotFound    = errors.New("webhook event not found")
	ErrDeliveryNotFound = errors.New("webhook delivery not found")
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) BeginTx(ctx context.Context) (pgx.Tx, error) {
	return r.db.BeginTx(ctx, pgx.TxOptions{})
}

const endpointColumns = `
	id, team_id, url, description, enabled, subscribed_events,
	api_version, created_at, updated_at, disabled_at`

const eventColumns = `
	id, team_id, type, object_type, object_id, api_version,
	payload, occurred_at, created_at`

const deliveryColumns = `
	id, event_id, endpoint_id, status, attempt_count, next_attempt_at,
	last_attempt_at, response_status, response_body, last_error,
	delivered_at, created_at, updated_at`

func (r *Repository) CreateEndpoint(ctx context.Context, teamID uuid.UUID, value validatedEndpoint, secret string) (Endpoint, error) {
	row := r.db.QueryRow(ctx, `
		INSERT INTO webhook_endpoints (
			team_id, url, description, signing_secret, enabled,
			subscribed_events, api_version
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING `+endpointColumns,
		teamID, value.URL, value.Description, secret, value.Enabled,
		value.SubscribedEvents, value.APIVersion,
	)
	return scanEndpoint(row)
}

func (r *Repository) ListEndpoints(ctx context.Context, teamID uuid.UUID, limit, offset int32) ([]Endpoint, error) {
	rows, err := r.db.Query(ctx, `
		SELECT `+endpointColumns+`
		FROM webhook_endpoints
		WHERE team_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`, teamID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list webhook endpoints: %w", err)
	}
	defer rows.Close()

	endpoints := make([]Endpoint, 0)
	for rows.Next() {
		endpoint, scanErr := scanEndpoint(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan webhook endpoint: %w", scanErr)
		}
		endpoints = append(endpoints, endpoint)
	}
	return endpoints, rows.Err()
}

func (r *Repository) GetEndpoint(ctx context.Context, id, teamID uuid.UUID) (Endpoint, error) {
	endpoint, err := scanEndpoint(r.db.QueryRow(ctx, `
		SELECT `+endpointColumns+`
		FROM webhook_endpoints
		WHERE id = $1 AND team_id = $2`, id, teamID))
	if errors.Is(err, pgx.ErrNoRows) {
		return Endpoint{}, ErrEndpointNotFound
	}
	if err != nil {
		return Endpoint{}, fmt.Errorf("get webhook endpoint: %w", err)
	}
	return endpoint, nil
}

func (r *Repository) UpdateEndpoint(ctx context.Context, id, teamID uuid.UUID, value validatedEndpoint) (Endpoint, error) {
	endpoint, err := scanEndpoint(r.db.QueryRow(ctx, `
		UPDATE webhook_endpoints
		SET url = $1,
			description = $2,
			enabled = $3,
			subscribed_events = $4,
			api_version = $5,
			disabled_at = CASE WHEN $3 THEN NULL ELSE COALESCE(disabled_at, now()) END,
			updated_at = now()
		WHERE id = $6 AND team_id = $7
		RETURNING `+endpointColumns,
		value.URL, value.Description, value.Enabled, value.SubscribedEvents,
		value.APIVersion, id, teamID,
	))
	if errors.Is(err, pgx.ErrNoRows) {
		return Endpoint{}, ErrEndpointNotFound
	}
	if err != nil {
		return Endpoint{}, fmt.Errorf("update webhook endpoint: %w", err)
	}
	return endpoint, nil
}

func (r *Repository) DisableEndpoint(ctx context.Context, id, teamID uuid.UUID) error {
	tag, err := r.db.Exec(ctx, `
		UPDATE webhook_endpoints
		SET enabled = false,
			disabled_at = COALESCE(disabled_at, now()),
			updated_at = now()
		WHERE id = $1 AND team_id = $2`, id, teamID)
	if err != nil {
		return fmt.Errorf("disable webhook endpoint: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrEndpointNotFound
	}
	return nil
}

func (r *Repository) RotateSecret(ctx context.Context, id, teamID uuid.UUID, secret string) error {
	tag, err := r.db.Exec(ctx, `
		UPDATE webhook_endpoints
		SET signing_secret = $1, updated_at = now()
		WHERE id = $2 AND team_id = $3`, secret, id, teamID)
	if err != nil {
		return fmt.Errorf("rotate webhook secret: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrEndpointNotFound
	}
	return nil
}

func (r *Repository) CreateTestEventTx(ctx context.Context, tx pgx.Tx, teamID uuid.UUID) (Event, error) {
	return scanEvent(tx.QueryRow(ctx, `
		INSERT INTO webhook_events (team_id, type, object_type, payload)
		VALUES ($1, $2, 'sms_message', '{"message":{"id":"test","status":"delivered"},"test":true}'::jsonb)
		RETURNING `+eventColumns, teamID, EventSMSDelivered))
}

func (r *Repository) CreateDeliveryTx(ctx context.Context, tx pgx.Tx, eventID, endpointID uuid.UUID) (Delivery, error) {
	return scanDelivery(tx.QueryRow(ctx, `
		INSERT INTO webhook_deliveries (event_id, endpoint_id)
		VALUES ($1, $2)
		RETURNING `+deliveryColumns, eventID, endpointID))
}

func (r *Repository) ListEvents(ctx context.Context, teamID uuid.UUID, limit, offset int32) ([]Event, error) {
	rows, err := r.db.Query(ctx, `
		SELECT `+eventColumns+`
		FROM webhook_events
		WHERE team_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`, teamID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list webhook events: %w", err)
	}
	defer rows.Close()

	events := make([]Event, 0)
	for rows.Next() {
		event, scanErr := scanEvent(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan webhook event: %w", scanErr)
		}
		events = append(events, event)
	}
	return events, rows.Err()
}

func (r *Repository) GetEvent(ctx context.Context, id, teamID uuid.UUID) (Event, error) {
	event, err := scanEvent(r.db.QueryRow(ctx, `
		SELECT `+eventColumns+`
		FROM webhook_events
		WHERE id = $1 AND team_id = $2`, id, teamID))
	if errors.Is(err, pgx.ErrNoRows) {
		return Event{}, ErrEventNotFound
	}
	if err != nil {
		return Event{}, fmt.Errorf("get webhook event: %w", err)
	}
	return event, nil
}

func (r *Repository) GetDelivery(ctx context.Context, id, teamID uuid.UUID) (Delivery, error) {
	delivery, err := scanDelivery(r.db.QueryRow(ctx, `
		SELECT `+deliveryColumns+`
		FROM webhook_deliveries AS delivery
		JOIN webhook_events AS event ON event.id = delivery.event_id
		WHERE delivery.id = $1 AND event.team_id = $2`, id, teamID))
	if errors.Is(err, pgx.ErrNoRows) {
		return Delivery{}, ErrDeliveryNotFound
	}
	if err != nil {
		return Delivery{}, fmt.Errorf("get webhook delivery: %w", err)
	}
	return delivery, nil
}

func (r *Repository) RetryDelivery(ctx context.Context, id, teamID uuid.UUID) (Delivery, error) {
	delivery, err := scanDelivery(r.db.QueryRow(ctx, `
		UPDATE webhook_deliveries AS delivery
		SET status = $1,
			next_attempt_at = now(),
			last_error = NULL,
			locked_at = NULL,
			locked_by = NULL,
			updated_at = now()
		FROM webhook_events AS event
		WHERE delivery.id = $2
			AND event.id = delivery.event_id
			AND event.team_id = $3
		RETURNING `+deliveryColumns, DeliveryPending, id, teamID))
	if errors.Is(err, pgx.ErrNoRows) {
		return Delivery{}, ErrDeliveryNotFound
	}
	if err != nil {
		return Delivery{}, fmt.Errorf("retry webhook delivery: %w", err)
	}
	return delivery, nil
}

func scanEndpoint(row pgx.Row) (Endpoint, error) {
	var endpoint Endpoint
	var id, teamID uuid.UUID
	err := row.Scan(
		&id, &teamID, &endpoint.URL, &endpoint.Description, &endpoint.Enabled,
		&endpoint.SubscribedEvents, &endpoint.APIVersion, &endpoint.CreatedAt,
		&endpoint.UpdatedAt, &endpoint.DisabledAt,
	)
	endpoint.ID = id.String()
	endpoint.TeamID = teamID.String()
	return endpoint, err
}

func scanEvent(row pgx.Row) (Event, error) {
	var event Event
	var id, teamID uuid.UUID
	var objectID *uuid.UUID
	err := row.Scan(
		&id, &teamID, &event.Type, &event.ObjectType, &objectID,
		&event.APIVersion, &event.Payload, &event.OccurredAt, &event.CreatedAt,
	)
	event.ID = id.String()
	event.TeamID = teamID.String()
	if objectID != nil {
		value := objectID.String()
		event.ObjectID = &value
	}
	return event, err
}

func scanDelivery(row pgx.Row) (Delivery, error) {
	var delivery Delivery
	var id, eventID, endpointID uuid.UUID
	err := row.Scan(
		&id, &eventID, &endpointID, &delivery.Status, &delivery.AttemptCount,
		&delivery.NextAttemptAt, &delivery.LastAttemptAt, &delivery.ResponseStatus,
		&delivery.ResponseBody, &delivery.LastError, &delivery.DeliveredAt,
		&delivery.CreatedAt, &delivery.UpdatedAt,
	)
	delivery.ID = id.String()
	delivery.EventID = eventID.String()
	delivery.EndpointID = endpointID.String()
	return delivery, err
}
