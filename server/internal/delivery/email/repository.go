package emaildelivery

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

var ErrMessageNotDeliverable = errors.New("email message is not deliverable")

type DeliveryMessage struct {
	ID          uuid.UUID
	TeamID      uuid.UUID
	FromEmail   string
	FromName    string
	ReplyTo     []Address
	To          []Address
	CC          []Address
	BCC         []Address
	Subject     string
	HTML        string
	Text        string
	Headers     map[string]string
	Attachments []Attachment
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Claim(ctx context.Context, messageID, teamID uuid.UUID) (DeliveryMessage, error) {
	if r == nil || r.db == nil {
		return DeliveryMessage{}, errors.New("email delivery repository is not configured")
	}

	var message DeliveryMessage
	var fromName *string
	var htmlBody, textBody *string
	var recipientsJSON, headersJSON, attachmentsJSON []byte
	err := r.db.QueryRow(ctx, `
		UPDATE email_messages
		SET status = 'processing',
			processing_at = COALESCE(processing_at, now()),
			error_code = NULL,
			error_message = NULL,
			updated_at = now()
		WHERE id = $1
		  AND team_id = $2
		  AND status IN ('queued', 'processing')
		RETURNING id, team_id, from_email, from_name, subject, html_body, text_body,
			recipients, headers, attachments
	`, messageID, teamID).Scan(
		&message.ID,
		&message.TeamID,
		&message.FromEmail,
		&fromName,
		&message.Subject,
		&htmlBody,
		&textBody,
		&recipientsJSON,
		&headersJSON,
		&attachmentsJSON,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return DeliveryMessage{}, ErrMessageNotDeliverable
	}
	if err != nil {
		return DeliveryMessage{}, fmt.Errorf("claim email message: %w", err)
	}
	if fromName != nil {
		message.FromName = *fromName
	}
	if htmlBody != nil {
		message.HTML = *htmlBody
	}
	if textBody != nil {
		message.Text = *textBody
	}

	var recipients struct {
		To      []Address `json:"to"`
		CC      []Address `json:"cc"`
		BCC     []Address `json:"bcc"`
		ReplyTo []Address `json:"reply_to"`
	}
	if err := json.Unmarshal(recipientsJSON, &recipients); err != nil {
		return DeliveryMessage{}, fmt.Errorf("decode email recipients: %w", err)
	}
	message.To, message.CC, message.BCC, message.ReplyTo = recipients.To, recipients.CC, recipients.BCC, recipients.ReplyTo
	if err := json.Unmarshal(headersJSON, &message.Headers); err != nil {
		return DeliveryMessage{}, fmt.Errorf("decode email headers: %w", err)
	}
	if err := json.Unmarshal(attachmentsJSON, &message.Attachments); err != nil {
		return DeliveryMessage{}, fmt.Errorf("decode email attachments: %w", err)
	}
	return message, nil
}

func (r *Repository) MarkSubmitted(ctx context.Context, messageID, teamID uuid.UUID, result ProviderResult) error {
	commandTag, err := r.db.Exec(ctx, `
		UPDATE email_messages
		SET status = 'submitted',
			provider = $3,
			provider_message_id = $4,
			submitted_at = now(),
			error_code = NULL,
			error_message = NULL,
			updated_at = now()
		WHERE id = $1 AND team_id = $2 AND status = 'processing'
	`, messageID, teamID, result.Provider, result.MessageID)
	if err != nil {
		return fmt.Errorf("mark email submitted: %w", err)
	}
	if commandTag.RowsAffected() == 0 {
		return ErrMessageNotDeliverable
	}
	return nil
}

func (r *Repository) MarkRetryable(ctx context.Context, messageID, teamID uuid.UUID, cause error) error {
	message := truncateError(cause)
	_, err := r.db.Exec(ctx, `
		UPDATE email_messages
		SET error_code = 'provider_retryable', error_message = $3, updated_at = now()
		WHERE id = $1 AND team_id = $2 AND status = 'processing'
	`, messageID, teamID, message)
	if err != nil {
		return fmt.Errorf("record retryable email failure: %w", err)
	}
	return nil
}

func (r *Repository) MarkFailed(ctx context.Context, messageID, teamID uuid.UUID, code string, cause error) error {
	message := truncateError(cause)
	_, err := r.db.Exec(ctx, `
		UPDATE email_messages
		SET status = 'failed',
			error_code = $3,
			error_message = $4,
			failed_at = now(),
			updated_at = now()
		WHERE id = $1 AND team_id = $2 AND status IN ('queued', 'processing')
	`, messageID, teamID, code, message)
	if err != nil {
		return fmt.Errorf("mark email failed: %w", err)
	}
	return nil
}

func truncateError(err error) string {
	if err == nil {
		return "unknown email delivery failure"
	}
	value := err.Error()
	const maxLength = 2000
	if len(value) > maxLength {
		return value[:maxLength]
	}
	return value
}

func (r *Repository) ResetStaleProcessing(ctx context.Context, olderThan time.Time) (int64, error) {
	commandTag, err := r.db.Exec(ctx, `
		UPDATE email_messages
		SET status = 'queued', processing_at = NULL, updated_at = now()
		WHERE status = 'processing' AND processing_at < $1
	`, olderThan)
	if err != nil {
		return 0, fmt.Errorf("reset stale email messages: %w", err)
	}
	return commandTag.RowsAffected(), nil
}
