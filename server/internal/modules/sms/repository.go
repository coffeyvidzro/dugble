package sms

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

var ErrMessageNotFound = errors.New("sms message not found")

type Repository struct {
	db      *pgxpool.Pool
	queries *dbsqlc.Queries
}

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db, queries: dbsqlc.New(db)} }

func (r *Repository) BeginTx(ctx context.Context) (pgx.Tx, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("begin sms transaction: %w", err)
	}
	return tx, nil
}

func (r *Repository) WithTx(tx pgx.Tx) *Repository {
	return &Repository{db: r.db, queries: r.queries.WithTx(tx)}
}

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
	row, err := r.queries.CreateSMSMessage(ctx, dbsqlc.CreateSMSMessageParams{
		TeamID:          params.TeamID,
		SenderID:        params.SenderID,
		ToNumber:        params.To,
		FromName:        params.From,
		Body:            params.Body,
		Status:          params.Status,
		Segments:        params.Segments,
		CostMicros:      params.CostMicros,
		ClientReference: params.ClientReference,
		Metadata:        ensureMetadata(params.Metadata),
	})
	if err != nil {
		return Message{}, fmt.Errorf("create sms message: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) List(ctx context.Context, teamID uuid.UUID, limit, offset int32) ([]Message, error) {
	rows, err := r.queries.ListSMSMessages(ctx, dbsqlc.ListSMSMessagesParams{TeamID: teamID, LimitCount: limit, OffsetCount: offset})
	if err != nil {
		return nil, fmt.Errorf("list sms messages: %w", err)
	}
	messages := make([]Message, 0, len(rows))
	for _, row := range rows {
		messages = append(messages, messageFromSQLC(row))
	}
	return messages, nil
}

func (r *Repository) Get(ctx context.Context, id uuid.UUID, teamID uuid.UUID) (Message, error) {
	row, err := r.queries.GetSMSMessage(ctx, dbsqlc.GetSMSMessageParams{ID: id, TeamID: teamID})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Message{}, ErrMessageNotFound
		}
		return Message{}, fmt.Errorf("get sms message: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) MarkProcessing(ctx context.Context, id uuid.UUID, teamID uuid.UUID) (Message, error) {
	row, err := r.queries.MarkSMSMessageProcessing(ctx, dbsqlc.MarkSMSMessageProcessingParams{ID: id, TeamID: teamID})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Message{}, ErrMessageNotFound
		}
		return Message{}, fmt.Errorf("mark sms message processing: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) MarkRefundPending(ctx context.Context, id uuid.UUID, teamID uuid.UUID, message string) (Message, error) {
	row, err := r.queries.MarkSMSMessageRefundPending(ctx, dbsqlc.MarkSMSMessageRefundPendingParams{ID: id, TeamID: teamID, ErrorMessage: &message})
	if err != nil {
		return Message{}, fmt.Errorf("mark sms message refund pending: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) MarkSubmitted(ctx context.Context, id uuid.UUID, teamID uuid.UUID, providerID string, providerMessageID string, status string) (Message, error) {
	row, err := r.queries.MarkSMSMessageSubmitted(ctx, dbsqlc.MarkSMSMessageSubmittedParams{
		ID:                id,
		TeamID:            teamID,
		ProviderID:        &providerID,
		ProviderMessageID: &providerMessageID,
		Status:            status,
	})
	if err != nil {
		return Message{}, fmt.Errorf("mark sms message submitted: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) MarkFailed(ctx context.Context, id uuid.UUID, teamID uuid.UUID, message string) (Message, error) {
	row, err := r.queries.MarkSMSMessageFailed(ctx, dbsqlc.MarkSMSMessageFailedParams{ID: id, TeamID: teamID, ErrorMessage: &message})
	if err != nil {
		return Message{}, fmt.Errorf("mark sms message failed: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id uuid.UUID, teamID uuid.UUID, status string) (Message, error) {
	row, err := r.queries.UpdateSMSMessageStatus(ctx, dbsqlc.UpdateSMSMessageStatusParams{ID: id, TeamID: teamID, Status: status})
	if err != nil {
		return Message{}, fmt.Errorf("update sms message status: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) FindApprovedSender(ctx context.Context, teamID uuid.UUID, name string) (*uuid.UUID, error) {
	id, err := r.queries.FindApprovedSMSSender(ctx, dbsqlc.FindApprovedSMSSenderParams{TeamID: teamID, Name: name})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("find approved sender id: %w", err)
	}
	return &id, nil
}

func messageFromSQLC(row dbsqlc.SmsMessage) Message {
	message := Message{
		ID:                row.ID.String(),
		TeamID:            row.TeamID.String(),
		To:                row.ToNumber,
		From:              row.FromName,
		Body:              row.Body,
		Status:            row.Status,
		ProviderID:        row.ProviderID,
		ProviderMessageID: row.ProviderMessageID,
		Segments:          row.Segments,
		CostMicros:        row.CostMicros,
		ClientReference:   row.ClientReference,
		ErrorMessage:      row.ErrorMessage,
		Metadata:          ensureMetadata(row.Metadata),
		CreatedAt:         row.CreatedAt.Time,
		UpdatedAt:         row.UpdatedAt.Time,
	}
	if row.SenderID != nil {
		value := row.SenderID.String()
		message.SenderID = &value
	}
	if row.SubmittedAt.Valid {
		message.SubmittedAt = &row.SubmittedAt.Time
	}
	if row.DeliveredAt.Valid {
		message.DeliveredAt = &row.DeliveredAt.Time
	}
	return message
}

func ensureMetadata(metadata json.RawMessage) json.RawMessage {
	if len(metadata) == 0 {
		return json.RawMessage(`{}`)
	}
	return metadata
}
