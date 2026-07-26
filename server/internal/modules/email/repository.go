package email

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("email message not found")

type Repository struct{ db *pgxpool.Pool }

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db} }
func (r *Repository) BeginTx(ctx context.Context) (pgx.Tx, error) {
	return r.db.BeginTx(ctx, pgx.TxOptions{})
}

const columns = `id, team_id, message_type, from_email, from_name, reply_to_email, to_email, to_name,
 subject, html_body, text_body, status, provider, provider_message_id, error_code, error_message,
 metadata, queued_at, processing_at, submitted_at, delivered_at, failed_at, created_at, updated_at`

type rowScanner interface{ Scan(...any) error }

func scanMessage(row rowScanner) (Message, error) {
	var m Message
	err := row.Scan(&m.ID, &m.TeamID, &m.MessageType, &m.FromEmail, &m.FromName, &m.ReplyToEmail, &m.ToEmail, &m.ToName,
		&m.Subject, &m.HTMLBody, &m.TextBody, &m.Status, &m.Provider, &m.ProviderMessageID, &m.ErrorCode, &m.ErrorMessage,
		&m.Metadata, &m.QueuedAt, &m.ProcessingAt, &m.SubmittedAt, &m.DeliveredAt, &m.FailedAt, &m.CreatedAt, &m.UpdatedAt)
	return m, err
}

func (r *Repository) CreateTx(ctx context.Context, tx pgx.Tx, teamID uuid.UUID, req SendRequest) (Message, error) {
	row := tx.QueryRow(ctx, `INSERT INTO email_messages
 (team_id, message_type, from_email, from_name, reply_to_email, to_email, to_name, subject, html_body, text_body, status, metadata)
 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'queued',$11) RETURNING `+columns,
		teamID, req.MessageType, req.FromEmail, req.FromName, req.ReplyToEmail, req.ToEmail, req.ToName, req.Subject, req.HTMLBody, req.TextBody, req.Metadata)
	m, err := scanMessage(row)
	if err != nil {
		return Message{}, fmt.Errorf("create email message: %w", err)
	}
	return m, nil
}

func (r *Repository) Get(ctx context.Context, id, teamID uuid.UUID) (Message, error) {
	m, err := scanMessage(r.db.QueryRow(ctx, `SELECT `+columns+` FROM email_messages WHERE id=$1 AND team_id=$2`, id, teamID))
	if errors.Is(err, pgx.ErrNoRows) {
		return Message{}, ErrNotFound
	}
	if err != nil {
		return Message{}, fmt.Errorf("get email message: %w", err)
	}
	return m, nil
}

func (r *Repository) List(ctx context.Context, teamID uuid.UUID, limit, offset int32) ([]Message, error) {
	rows, err := r.db.Query(ctx, `SELECT `+columns+` FROM email_messages WHERE team_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, teamID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("list email messages: %w", err)
	}
	defer rows.Close()
	result := make([]Message, 0)
	for rows.Next() {
		m, scanErr := scanMessage(rows)
		if scanErr != nil {
			return nil, fmt.Errorf("scan email message: %w", scanErr)
		}
		result = append(result, m)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate email messages: %w", err)
	}
	return result, nil
}
