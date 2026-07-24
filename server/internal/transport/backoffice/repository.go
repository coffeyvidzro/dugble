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

func (r *Repository) Teams(ctx context.Context, filter TeamFilter) ([]TeamRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, name, status, created_at
		FROM teams
		WHERE $1 = '' OR name ILIKE '%' || $1 || '%'
		ORDER BY created_at DESC
		LIMIT 100
	`, filter.Query)
	if err != nil {
		return nil, fmt.Errorf("list teams: %w", err)
	}
	defer rows.Close()

	var teams []TeamRow
	for rows.Next() {
		var row TeamRow
		if err := rows.Scan(&row.ID, &row.Name, &row.Status, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan team: %w", err)
		}
		teams = append(teams, row)
	}

	return teams, rows.Err()
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

func (r *Repository) Wallets(ctx context.Context, filter WalletFilter) ([]WalletRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT w.id::text, t.name, w.currency, w.balance, w.status, w.updated_at
		FROM wallets w
		JOIN teams t ON t.id = w.team_id
		WHERE ($1 = '' OR t.name ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR w.status = $2)
		ORDER BY w.updated_at DESC
		LIMIT 100
	`, filter.Query, filter.Status)
	if err != nil {
		return nil, fmt.Errorf("list wallets: %w", err)
	}
	defer rows.Close()

	var wallets []WalletRow
	for rows.Next() {
		var row WalletRow
		if err := rows.Scan(&row.ID, &row.TeamName, &row.Currency, &row.Balance, &row.Status, &row.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan wallet: %w", err)
		}
		wallets = append(wallets, row)
	}

	return wallets, rows.Err()
}

func (r *Repository) SenderIDs(ctx context.Context, filter SenderIDFilter) ([]SenderIDRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT s.id::text, t.name, s.name, s.country_code, s.status, s.created_at
		FROM sender_ids s
		JOIN teams t ON t.id = s.team_id
		WHERE ($1 = '' OR t.name ILIKE '%' || $1 || '%' OR s.name ILIKE '%' || $1 || '%' OR s.country_code ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR s.status = $2)
		ORDER BY s.created_at DESC
		LIMIT 100
	`, filter.Query, filter.Status)
	if err != nil {
		return nil, fmt.Errorf("list sender ids: %w", err)
	}
	defer rows.Close()

	var senderIDs []SenderIDRow
	for rows.Next() {
		var row SenderIDRow
		if err := rows.Scan(&row.ID, &row.TeamName, &row.Name, &row.CountryCode, &row.Status, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan sender id: %w", err)
		}
		senderIDs = append(senderIDs, row)
	}

	return senderIDs, rows.Err()
}

func (r *Repository) Domains(ctx context.Context, filter DomainFilter) ([]DomainRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT d.id::text, t.name, d.domain, d.provider, d.status, d.created_at
		FROM sender_domains d
		JOIN teams t ON t.id = d.team_id
		WHERE ($1 = '' OR t.name ILIKE '%' || $1 || '%' OR d.domain ILIKE '%' || $1 || '%' OR d.provider ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR d.status = $2)
		ORDER BY d.created_at DESC
		LIMIT 100
	`, filter.Query, filter.Status)
	if err != nil {
		return nil, fmt.Errorf("list domains: %w", err)
	}
	defer rows.Close()

	var domains []DomainRow
	for rows.Next() {
		var row DomainRow
		if err := rows.Scan(&row.ID, &row.TeamName, &row.Domain, &row.Provider, &row.Status, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan domain: %w", err)
		}
		domains = append(domains, row)
	}

	return domains, rows.Err()
}
