package email

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

var ErrNotFound = errors.New("email message not found")

type Repository struct {
	db      *pgxpool.Pool
	queries *dbsqlc.Queries
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db, queries: dbsqlc.New(db)}
}

func (r *Repository) BeginTx(ctx context.Context) (pgx.Tx, error) {
	return r.db.BeginTx(ctx, pgx.TxOptions{})
}

func (r *Repository) CreateTx(ctx context.Context, tx pgx.Tx, teamID uuid.UUID, req validatedSend) (Message, error) {
	recipients, err := json.Marshal(map[string][]EmailAddress{"to": req.To, "cc": req.CC, "bcc": req.BCC, "reply_to": req.ReplyTo})
	if err != nil {
		return Message{}, fmt.Errorf("encode email recipients: %w", err)
	}
	headers, err := json.Marshal(req.Headers)
	if err != nil {
		return Message{}, fmt.Errorf("encode email headers: %w", err)
	}
	attachments, err := json.Marshal(req.Attachments)
	if err != nil {
		return Message{}, fmt.Errorf("encode email attachments: %w", err)
	}
	tags, err := json.Marshal(req.Tags)
	if err != nil {
		return Message{}, fmt.Errorf("encode email tags: %w", err)
	}
	row, err := r.queries.WithTx(tx).CreateEmailMessage(ctx, dbsqlc.CreateEmailMessageParams{
		TeamID:       teamID,
		MessageType:  req.MessageType,
		FromEmail:    req.FromEmail,
		FromName:     req.FromName,
		ReplyToEmail: req.ReplyToEmail,
		ToEmail:      req.ToEmail,
		ToName:       req.ToName,
		Subject:      req.Subject,
		HtmlBody:     req.HTMLBody,
		TextBody:     req.TextBody,
		Metadata:     req.Metadata,
		Recipients:   recipients, Headers: headers, Attachments: attachments, Tags: tags,
		ScheduledAt: timestamptz(req.ScheduledAt),
	})
	if err != nil {
		return Message{}, fmt.Errorf("create email message: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) Get(ctx context.Context, id, teamID uuid.UUID) (Message, error) {
	row, err := r.queries.GetEmailMessage(ctx, dbsqlc.GetEmailMessageParams{ID: id, TeamID: teamID})
	if errors.Is(err, pgx.ErrNoRows) {
		return Message{}, ErrNotFound
	}
	if err != nil {
		return Message{}, fmt.Errorf("get email message: %w", err)
	}
	return messageFromSQLC(row), nil
}

func (r *Repository) List(ctx context.Context, teamID uuid.UUID, limit, offset int32) ([]MessageSummary, error) {
	rows, err := r.queries.ListEmailMessages(ctx, dbsqlc.ListEmailMessagesParams{
		TeamID: teamID, LimitCount: limit, OffsetCount: offset,
	})
	if err != nil {
		return nil, fmt.Errorf("list email messages: %w", err)
	}
	messages := make([]MessageSummary, 0, len(rows))
	for _, row := range rows {
		messages = append(messages, MessageSummary{
			ID: row.ID.String(), ToEmail: row.ToEmail, ToName: row.ToName, Subject: row.Subject,
			Status: row.Status, Provider: row.Provider, QueuedAt: row.QueuedAt.Time,
			SubmittedAt: optionalTime(row.SubmittedAt), DeliveredAt: optionalTime(row.DeliveredAt),
			CreatedAt: row.CreatedAt.Time,
		})
	}
	return messages, nil
}

func messageFromSQLC(row dbsqlc.EmailMessage) Message {
	message := Message{
		ID:                row.ID.String(),
		TeamID:            row.TeamID.String(),
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
		Metadata:          json.RawMessage(row.Metadata),
		ScheduledAt:       optionalTime(row.ScheduledAt),
		QueuedAt:          row.QueuedAt.Time,
		ProcessingAt:      optionalTime(row.ProcessingAt),
		SubmittedAt:       optionalTime(row.SubmittedAt),
		DeliveredAt:       optionalTime(row.DeliveredAt),
		FailedAt:          optionalTime(row.FailedAt),
		CreatedAt:         row.CreatedAt.Time,
		UpdatedAt:         row.UpdatedAt.Time,
	}
	var recipients struct {
		To      []EmailAddress `json:"to"`
		CC      []EmailAddress `json:"cc"`
		BCC     []EmailAddress `json:"bcc"`
		ReplyTo []EmailAddress `json:"reply_to"`
	}
	_ = json.Unmarshal(row.Recipients, &recipients)
	message.To, message.CC, message.BCC, message.ReplyTo = recipients.To, recipients.CC, recipients.BCC, recipients.ReplyTo
	_ = json.Unmarshal(row.Headers, &message.Headers)
	_ = json.Unmarshal(row.Attachments, &message.Attachments)
	_ = json.Unmarshal(row.Tags, &message.Tags)
	return message
}

func optionalTime(value pgtype.Timestamptz) *time.Time {
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
