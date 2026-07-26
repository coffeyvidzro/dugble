package email

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

var ErrMessageNotFound = errors.New("email message not found")

type Repository struct {
	db      *pgxpool.Pool
	queries *dbsqlc.Queries
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db, queries: dbsqlc.New(db)}
}

func (r *Repository) BeginTx(ctx context.Context) (pgx.Tx, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, fmt.Errorf("begin email transaction: %w", err)
	}
	return tx, nil
}

func (r *Repository) WithTx(tx pgx.Tx) *Repository {
	return &Repository{db: r.db, queries: r.queries.WithTx(tx)}
}

type createMessageParams struct {
	TeamID          uuid.UUID
	IdempotencyKey  *string
	IdempotencyHash *string
	MessageType     string
	FromEmail       string
	FromName        *string
	ReplyToEmail    *string
	ToEmail         string
	ToName          *string
	Subject         string
	HTMLBody        *string
	TextBody        *string
	Status          string
	Metadata        json.RawMessage
}

func (r *Repository) Create(ctx context.Context, params createMessageParams) (Message, error) {
	row, err := r.queries.CreateEmailMessage(ctx, dbsqlc.CreateEmailMessageParams{
		TeamID:          params.TeamID,
		IdempotencyKey:  params.IdempotencyKey,
		IdempotencyHash: params.IdempotencyHash,
		MessageType:     params.MessageType,
		FromEmail:       params.FromEmail,
		FromName:        params.FromName,
		ReplyToEmail:    params.ReplyToEmail,
		ToEmail:         params.ToEmail,
		ToName:          params.ToName,
		Subject:         params.Subject,
		HtmlBody:        params.HTMLBody,
		TextBody:        params.TextBody,
		Status:          params.Status,
		Metadata:        ensureMetadata(params.Metadata),
	})
	if err != nil {
		return Message{}, fmt.Errorf("create email message: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) List(ctx context.Context, teamID uuid.UUID, limit, offset int32) ([]Message, error) {
	rows, err := r.queries.ListEmailMessages(ctx, dbsqlc.ListEmailMessagesParams{
		TeamID:     teamID,
		LimitCount: limit,
		OffsetCount: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("list email messages: %w", err)
	}
	messages := make([]Message, 0, len(rows))
	for _, row := range rows {
		messages = append(messages, messageFromSQLC(row))
	}
	return messages, nil
}

func (r *Repository) Get(ctx context.Context, id uuid.UUID, teamID uuid.UUID) (Message, error) {
	row, err := r.queries.GetEmailMessage(ctx, dbsqlc.GetEmailMessageParams{ID: id, TeamID: teamID})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Message{}, ErrMessageNotFound
		}
		return Message{}, fmt.Errorf("get email message: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) GetByIdempotencyKey(ctx context.Context, teamID uuid.UUID, key string) (Message, error) {
	row, err := r.queries.GetEmailMessageByIdempotencyKey(ctx, dbsqlc.GetEmailMessageByIdempotencyKeyParams{
		TeamID:        teamID,
		IdempotencyKey: key,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Message{}, ErrMessageNotFound
		}
		return Message{}, fmt.Errorf("get email message by idempotency key: %w", err)
	}
	return messageFromSQLC(row), nil
}

func isIdempotencyUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505" && pgErr.ConstraintName == "uq_email_messages_team_idempotency"
}

func messageFromSQLC(row dbsqlc.EmailMessage) Message {
	return Message{
		ID:                row.ID.String(),
		TeamID:            row.TeamID.String(),
		IdempotencyKey:    row.IdempotencyKey,
		IdempotencyHash:   row.IdempotencyHash,
		MessageType:       row.MessageType,
		FromEmail:         row.FromEmail,
		FromName:          row.FromName,
		ReplyToEmail:      row.ReplyToEmail,
		ToEmail:           row.ToEmail,
		ToName:            row.ToName,
		Subject:           row.Subject,
		HTMLBody:          row.HtmlBody,
		TextBody:          row.TextBody,
		Status:            row.Status,
		Provider:          row.Provider,
		ProviderMessageID: row.ProviderMessageID,
		ErrorCode:         row.ErrorCode,
		ErrorMessage:      row.ErrorMessage,
		Metadata:          ensureMetadata(row.Metadata),
		QueuedAt:          row.QueuedAt.Time,
		ProcessingAt:      optionalTime(row.ProcessingAt),
		SubmittedAt:       optionalTime(row.SubmittedAt),
		DeliveredAt:       optionalTime(row.DeliveredAt),
		FailedAt:          optionalTime(row.FailedAt),
		CreatedAt:         row.CreatedAt.Time,
		UpdatedAt:         row.UpdatedAt.Time,
	}
}

func optionalTime(value pgtype.Timestamptz) *time.Time {
	if !value.Valid {
		return nil
	}
	return &value.Time
}
