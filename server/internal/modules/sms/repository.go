package sms

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

var ErrMessageNotFound = errors.New("sms message not found")
var ErrMessageNotSchedulable = errors.New("sms message is not a pending scheduled message")

type Repository struct {
	db      *pgxpool.Pool
	dbtx    dbsqlc.DBTX
	queries *dbsqlc.Queries
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db, dbtx: db, queries: dbsqlc.New(db)}
}

func (r *Repository) BeginTx(ctx context.Context) (pgx.Tx, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("begin sms transaction: %w", err)
	}
	return tx, nil
}

func (r *Repository) WithTx(tx pgx.Tx) *Repository {
	return &Repository{db: r.db, dbtx: tx, queries: r.queries.WithTx(tx)}
}

type createMessageParams struct {
	TeamID             uuid.UUID
	SenderID           *uuid.UUID
	To                 string
	From               string
	Body               string
	Status             string
	Segments           int32
	CostMicros         int64
	Metadata           json.RawMessage
	Tags               []Tag
	ScheduledAt        *time.Time
	DestinationCountry string
	PricingRuleID      uuid.UUID
	UnitCostMicros     int64
}

func (r *Repository) Create(ctx context.Context, params createMessageParams) (Message, error) {
	tags, err := json.Marshal(params.Tags)
	if err != nil {
		return Message{}, fmt.Errorf("encode SMS tags: %w", err)
	}
	row, err := r.queries.CreateSMSMessage(ctx, dbsqlc.CreateSMSMessageParams{
		TeamID:             params.TeamID,
		SenderID:           params.SenderID,
		ToNumber:           params.To,
		FromName:           params.From,
		Body:               params.Body,
		Status:             params.Status,
		Segments:           params.Segments,
		CostMicros:         params.CostMicros,
		Metadata:           ensureMetadata(params.Metadata),
		Tags:               tags,
		ScheduledAt:        timestamptz(params.ScheduledAt),
		DestinationCountry: params.DestinationCountry,
		PricingRuleID:      params.PricingRuleID,
		UnitCostMicros:     params.UnitCostMicros,
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

func (r *Repository) CancelTx(ctx context.Context, tx pgx.Tx, id, teamID uuid.UUID) (Message, error) {
	if err := lockScheduledSMS(ctx, tx, id, teamID); err != nil {
		return Message{}, err
	}
	if _, err := tx.Exec(ctx, `UPDATE sms_messages SET status = $3, updated_at = now() WHERE id = $1 AND team_id = $2`, id, teamID, StatusCanceled); err != nil {
		return Message{}, fmt.Errorf("cancel SMS message: %w", err)
	}
	return r.WithTx(tx).Get(ctx, id, teamID)
}

func (r *Repository) RescheduleTx(ctx context.Context, tx pgx.Tx, id, teamID uuid.UUID, scheduledAt time.Time) (Message, error) {
	if err := lockScheduledSMS(ctx, tx, id, teamID); err != nil {
		return Message{}, err
	}
	if _, err := tx.Exec(ctx, `UPDATE sms_messages SET scheduled_at = $3, updated_at = now() WHERE id = $1 AND team_id = $2`, id, teamID, scheduledAt); err != nil {
		return Message{}, fmt.Errorf("reschedule SMS message: %w", err)
	}
	return r.WithTx(tx).Get(ctx, id, teamID)
}

func lockScheduledSMS(ctx context.Context, tx pgx.Tx, id, teamID uuid.UUID) error {
	var status string
	var scheduledAt *time.Time
	err := tx.QueryRow(ctx, `SELECT status, scheduled_at FROM sms_messages WHERE id = $1 AND team_id = $2 FOR UPDATE`, id, teamID).Scan(&status, &scheduledAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return ErrMessageNotFound
	}
	if err != nil {
		return fmt.Errorf("lock scheduled SMS message: %w", err)
	}
	if status != StatusQueued || scheduledAt == nil || !scheduledAt.After(time.Now().UTC().Add(scheduleMutationCutoff)) {
		return ErrMessageNotSchedulable
	}
	return nil
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
		ID:                 row.ID.String(),
		TeamID:             row.TeamID.String(),
		To:                 row.ToNumber,
		From:               row.FromName,
		Body:               row.Body,
		Status:             row.Status,
		ProviderID:         row.ProviderID,
		ProviderMessageID:  row.ProviderMessageID,
		Segments:           row.Segments,
		CostMicros:         row.CostMicros,
		ErrorMessage:       row.ErrorMessage,
		Metadata:           ensureMetadata(row.Metadata),
		Tags:               decodeTags(row.Tags),
		ScheduledAt:        optionalTimestamptz(row.ScheduledAt),
		CreatedAt:          row.CreatedAt.Time,
		UpdatedAt:          row.UpdatedAt.Time,
		DestinationCountry: row.DestinationCountry,
		PricingRuleID:      row.PricingRuleID.String(),
		UnitCostMicros:     row.UnitCostMicros,
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
	message.Billing = billingFromAmounts(message.UnitCostMicros, message.CostMicros)
	return message
}

func optionalTimestamptz(value pgtype.Timestamptz) *time.Time {
	if !value.Valid {
		return nil
	}
	return &value.Time
}

func timestamptz(value *time.Time) pgtype.Timestamptz {
	if value == nil {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: *value, Valid: true}
}

func decodeTags(value []byte) []Tag {
	result := []Tag{}
	_ = json.Unmarshal(value, &result)
	return result
}

func billingFromAmounts(unitCostMicros int64, totalCostMicros int64) Billing {
	return Billing{
		UnitCost:  microsToUSD(unitCostMicros),
		TotalCost: microsToUSD(totalCostMicros),
		Currency:  "USD",
	}
}

func microsToUSD(micros int64) float64 {
	return float64(micros) / 1_000_000
}

func ensureMetadata(metadata json.RawMessage) json.RawMessage {
	if len(metadata) == 0 {
		return json.RawMessage(`{}`)
	}
	return metadata
}
