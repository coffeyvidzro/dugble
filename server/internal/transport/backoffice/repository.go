package backoffice

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) DashboardStats(ctx context.Context) (DashboardStats, error) {
	var stats DashboardStats
	if err := r.db.QueryRow(ctx, `
		SELECT
			(SELECT count(*) FROM users),
			(SELECT count(*) FROM teams),
			(SELECT count(*) FROM sms_messages WHERE created_at >= date_trunc('day', now())),
			(SELECT count(*) FROM sms_messages WHERE created_at >= now() - interval '24 hours' AND status IN ('failed', 'undelivered', 'rejected', 'expired')),
			(SELECT count(*) FROM sender_ids WHERE status = 'pending'),
			(SELECT count(*) FROM sender_domains WHERE status = 'pending')
	`).Scan(&stats.Users, &stats.Teams, &stats.SMSToday, &stats.FailedSMS24Hours, &stats.PendingSenderIDs, &stats.PendingDomains); err != nil {
		return DashboardStats{}, fmt.Errorf("load dashboard stats: %w", err)
	}

	return stats, nil
}

func (r *Repository) Users(ctx context.Context, filter UserFilter) ([]UserRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, email, name, email_verified, created_at
		FROM users
		WHERE $1 = '' OR email ILIKE '%' || $1 || '%' OR name ILIKE '%' || $1 || '%'
		ORDER BY created_at DESC
		LIMIT 100
	`, filter.Query)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}
	defer rows.Close()

	var users []UserRow
	for rows.Next() {
		var row UserRow
		if err := rows.Scan(&row.ID, &row.Email, &row.Name, &row.EmailVerified, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan user: %w", err)
		}
		users = append(users, row)
	}

	return users, rows.Err()
}

func (r *Repository) SMSMessages(ctx context.Context, filter SMSFilter) ([]SMSRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			s.id::text,
			t.name,
			s.to_number,
			s.from_name,
			s.status,
			coalesce(s.provider_id, ''),
			coalesce(s.error_message, ''),
			s.created_at
		FROM sms_messages s
		JOIN teams t ON t.id = s.team_id
		WHERE ($1 = '' OR t.name ILIKE '%' || $1 || '%' OR s.to_number ILIKE '%' || $1 || '%' OR s.from_name ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR s.status = $2)
		ORDER BY s.created_at DESC
		LIMIT 100
	`, filter.Query, filter.Status)
	if err != nil {
		return nil, fmt.Errorf("list sms messages: %w", err)
	}
	defer rows.Close()

	var messages []SMSRow
	for rows.Next() {
		var row SMSRow
		if err := rows.Scan(&row.ID, &row.TeamName, &row.ToNumber, &row.FromName, &row.Status, &row.ProviderID, &row.ErrorMessage, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan sms message: %w", err)
		}
		messages = append(messages, row)
	}

	return messages, rows.Err()
}

func (r *Repository) UserDetail(ctx context.Context, id string) (UserDetail, error) {
	var detail UserDetail
	if err := r.db.QueryRow(ctx, `
		SELECT id::text, email, name, email_verified, created_at
		FROM users
		WHERE id = $1::uuid
	`, id).Scan(&detail.User.ID, &detail.User.Email, &detail.User.Name, &detail.User.EmailVerified, &detail.User.CreatedAt); err != nil {
		return UserDetail{}, fmt.Errorf("get user detail: %w", err)
	}

	rows, err := r.db.Query(ctx, `
		SELECT t.id::text, t.name, tm.role, tm.status
		FROM team_members tm
		JOIN teams t ON t.id = tm.team_id
		WHERE tm.user_id = $1::uuid
		ORDER BY t.created_at DESC
	`, id)
	if err != nil {
		return UserDetail{}, fmt.Errorf("list user teams: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var row TeamMembershipRow
		if err := rows.Scan(&row.ID, &row.Name, &row.Role, &row.Status); err != nil {
			return UserDetail{}, fmt.Errorf("scan user team: %w", err)
		}
		detail.Teams = append(detail.Teams, row)
	}
	if err := rows.Err(); err != nil {
		return UserDetail{}, err
	}

	return detail, nil
}

func (r *Repository) SMSDetail(ctx context.Context, id string) (SMSDetail, error) {
	var detail SMSDetail
	if err := r.db.QueryRow(ctx, `
		SELECT
			s.id::text,
			t.id::text,
			t.name,
			coalesce(s.sender_id::text, ''),
			s.to_number,
			s.from_name,
			s.body,
			s.status,
			coalesce(s.provider_id, ''),
			coalesce(s.provider_message_id, ''),
			s.segments,
			s.cost_micros,
			coalesce(s.error_message, ''),
			coalesce(s.metadata::text, '{}'),
			coalesce(to_char(s.submitted_at, 'YYYY-MM-DD HH24:MI'), ''),
			coalesce(to_char(s.delivered_at, 'YYYY-MM-DD HH24:MI'), ''),
			s.created_at,
			s.updated_at
		FROM sms_messages s
		JOIN teams t ON t.id = s.team_id
		WHERE s.id = $1::uuid
	`, id).Scan(
		&detail.ID,
		&detail.TeamID,
		&detail.TeamName,
		&detail.SenderID,
		&detail.ToNumber,
		&detail.FromName,
		&detail.Body,
		&detail.Status,
		&detail.ProviderID,
		&detail.ProviderMessageID,
		&detail.Segments,
		&detail.CostMicros,
		&detail.ErrorMessage,
		&detail.Metadata,
		&detail.SubmittedAt,
		&detail.DeliveredAt,
		&detail.CreatedAt,
		&detail.UpdatedAt,
	); err != nil {
		return SMSDetail{}, fmt.Errorf("get sms detail: %w", err)
	}

	return detail, nil
}
