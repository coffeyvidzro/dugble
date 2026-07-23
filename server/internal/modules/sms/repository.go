package sms

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrMessageNotFound = errors.New("sms message not found")

type Repository struct{ db *pgxpool.Pool }

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db} }

type createMessageParams struct {
	TeamID          uuid.UUID
	SenderID        *uuid.UUID
	To              string
	From            string
	Body            string
	Status          string
	Segments        int32
	CostMicros      int64
	ClientReference *string
	Metadata        json.RawMessage
}

func (r *Repository) Create(ctx context.Context, params createMessageParams) (Message, error) {
	row := r.db.QueryRow(ctx, `
        INSERT INTO sms_messages (
            team_id, sender_id, to_number, from_name, body, status, segments,
            cost_micros, client_reference, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (team_id, client_reference) WHERE client_reference IS NOT NULL
        DO UPDATE SET updated_at = sms_messages.updated_at
        RETURNING id, team_id, sender_id, to_number, from_name, body, status,
            provider_id, provider_message_id, segments, cost_micros, client_reference,
            error_message, metadata, submitted_at, delivered_at, created_at, updated_at`,
		params.TeamID, params.SenderID, params.To, params.From, params.Body,
		params.Status, params.Segments, params.CostMicros, params.ClientReference,
		ensureMetadata(params.Metadata),
	)
	return scanMessage(row)
}

func (r *Repository) List(ctx context.Context, teamID uuid.UUID, limit, offset int32) ([]Message, error) {
	rows, err := r.db.Query(ctx, `
        SELECT id, team_id, sender_id, to_number, from_name, body, status,
            provider_id, provider_message_id, segments, cost_micros, client_reference,
            error_message, metadata, submitted_at, delivered_at, created_at, updated_at
        FROM sms_messages
        WHERE team_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`, teamID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list sms messages: %w", err)
	}
	defer rows.Close()
	messages := make([]Message, 0)
	for rows.Next() {
		message, err := scanMessage(rows)
		if err != nil {
			return nil, err
		}
		messages = append(messages, message)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("list sms messages rows: %w", err)
	}
	return messages, nil
}

func (r *Repository) Get(ctx context.Context, id uuid.UUID, teamID uuid.UUID) (Message, error) {
	row := r.db.QueryRow(ctx, `
        SELECT id, team_id, sender_id, to_number, from_name, body, status,
            provider_id, provider_message_id, segments, cost_micros, client_reference,
            error_message, metadata, submitted_at, delivered_at, created_at, updated_at
        FROM sms_messages
        WHERE id = $1 AND team_id = $2`, id, teamID)
	message, err := scanMessage(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Message{}, ErrMessageNotFound
		}
		return Message{}, err
	}
	return message, nil
}

func (r *Repository) MarkSubmitted(ctx context.Context, id uuid.UUID, teamID uuid.UUID, providerID string, providerMessageID string, status string) (Message, error) {
	row := r.db.QueryRow(ctx, `
        UPDATE sms_messages
        SET provider_id = $3, provider_message_id = $4, status = $5,
            error_message = NULL, submitted_at = COALESCE(submitted_at, now()), updated_at = now()
        WHERE id = $1 AND team_id = $2
        RETURNING id, team_id, sender_id, to_number, from_name, body, status,
            provider_id, provider_message_id, segments, cost_micros, client_reference,
            error_message, metadata, submitted_at, delivered_at, created_at, updated_at`,
		id, teamID, providerID, providerMessageID, status)
	return scanMessage(row)
}

func (r *Repository) MarkFailed(ctx context.Context, id uuid.UUID, teamID uuid.UUID, message string) (Message, error) {
	row := r.db.QueryRow(ctx, `
        UPDATE sms_messages
        SET status = 'failed', error_message = $3, updated_at = now()
        WHERE id = $1 AND team_id = $2
        RETURNING id, team_id, sender_id, to_number, from_name, body, status,
            provider_id, provider_message_id, segments, cost_micros, client_reference,
            error_message, metadata, submitted_at, delivered_at, created_at, updated_at`, id, teamID, message)
	return scanMessage(row)
}

func (r *Repository) UpdateStatus(ctx context.Context, id uuid.UUID, teamID uuid.UUID, status string) (Message, error) {
	row := r.db.QueryRow(ctx, `
        UPDATE sms_messages
        SET status = $3,
            delivered_at = CASE WHEN $3 = 'delivered' THEN COALESCE(delivered_at, now()) ELSE delivered_at END,
            updated_at = now()
        WHERE id = $1 AND team_id = $2
        RETURNING id, team_id, sender_id, to_number, from_name, body, status,
            provider_id, provider_message_id, segments, cost_micros, client_reference,
            error_message, metadata, submitted_at, delivered_at, created_at, updated_at`, id, teamID, status)
	return scanMessage(row)
}

func (r *Repository) FindApprovedSender(ctx context.Context, teamID uuid.UUID, name string) (*uuid.UUID, error) {
	var id uuid.UUID
	err := r.db.QueryRow(ctx, `
        SELECT id FROM sender_ids
        WHERE team_id = $1 AND lower(name) = lower($2) AND status = 'approved'
        ORDER BY created_at DESC LIMIT 1`, teamID, name).Scan(&id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("find approved sender id: %w", err)
	}
	return &id, nil
}

type rowScanner interface{ Scan(dest ...any) error }

func scanMessage(row rowScanner) (Message, error) {
	var message Message
	var id, teamID uuid.UUID
	var senderID *uuid.UUID
	var providerID, providerMessageID, clientReference, errorMessage *string
	var metadata []byte
	var submittedAt, deliveredAt *time.Time
	if err := row.Scan(&id, &teamID, &senderID, &message.To, &message.From, &message.Body, &message.Status, &providerID, &providerMessageID, &message.Segments, &message.CostMicros, &clientReference, &errorMessage, &metadata, &submittedAt, &deliveredAt, &message.CreatedAt, &message.UpdatedAt); err != nil {
		return Message{}, fmt.Errorf("scan sms message: %w", err)
	}
	message.ID = id.String()
	message.TeamID = teamID.String()
	if senderID != nil {
		v := senderID.String()
		message.SenderID = &v
	}
	message.ProviderID = providerID
	message.ProviderMessageID = providerMessageID
	message.ClientReference = clientReference
	message.ErrorMessage = errorMessage
	message.Metadata = ensureMetadata(metadata)
	message.SubmittedAt = submittedAt
	message.DeliveredAt = deliveredAt
	return message, nil
}

func ensureMetadata(metadata json.RawMessage) json.RawMessage {
	if len(metadata) == 0 {
		return json.RawMessage(`{}`)
	}
	return metadata
}
