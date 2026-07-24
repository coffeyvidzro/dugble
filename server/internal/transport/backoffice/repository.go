package backoffice

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	backofficewallets "github.com/coffeyvidzro/dugble/server/internal/backoffice/wallets"
)

var errNotFound = pgx.ErrNoRows

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

func (r *Repository) UpdateTeamStatus(ctx context.Context, id string, status string) error {
	tag, err := r.db.Exec(ctx, `
		UPDATE teams
		SET status = $2,
			updated_at = now()
		WHERE id = $1::uuid
	`, id, status)
	if err != nil {
		return fmt.Errorf("update team status: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("update team status: %w", errNotFound)
	}

	return nil
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

func (r *Repository) ApproveSenderID(ctx context.Context, id string) error {
	tag, err := r.db.Exec(ctx, `
		UPDATE sender_ids
		SET status = 'approved',
			approved_at = now(),
			rejected_at = NULL,
			rejection_reason = NULL,
			updated_at = now()
		WHERE id = $1::uuid
	`, id)
	if err != nil {
		return fmt.Errorf("approve sender id: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("approve sender id: %w", errNotFound)
	}

	return nil
}

func (r *Repository) RejectSenderID(ctx context.Context, id string, reason string) error {
	tag, err := r.db.Exec(ctx, `
		UPDATE sender_ids
		SET status = 'rejected',
			rejected_at = now(),
			approved_at = NULL,
			rejection_reason = $2,
			updated_at = now()
		WHERE id = $1::uuid
	`, id, reason)
	if err != nil {
		return fmt.Errorf("reject sender id: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("reject sender id: %w", errNotFound)
	}

	return nil
}

func (r *Repository) VerifyDomain(ctx context.Context, id string) error {
	tag, err := r.db.Exec(ctx, `
		UPDATE sender_domains
		SET status = 'verified',
			verified_at = now(),
			failure_reason = NULL,
			updated_at = now()
		WHERE id = $1::uuid
	`, id)
	if err != nil {
		return fmt.Errorf("verify sender domain: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("verify sender domain: %w", errNotFound)
	}

	return nil
}

func (r *Repository) FailDomain(ctx context.Context, id string, reason string) error {
	tag, err := r.db.Exec(ctx, `
		UPDATE sender_domains
		SET status = 'failed',
			failure_reason = $2,
			updated_at = now()
		WHERE id = $1::uuid
	`, id, reason)
	if err != nil {
		return fmt.Errorf("fail sender domain: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("fail sender domain: %w", errNotFound)
	}

	return nil
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

func (r *Repository) TeamDetail(ctx context.Context, id string) (TeamDetail, error) {
	var detail TeamDetail
	if err := r.db.QueryRow(ctx, `
		SELECT id::text, name, status, created_at
		FROM teams
		WHERE id = $1::uuid
	`, id).Scan(&detail.Team.ID, &detail.Team.Name, &detail.Team.Status, &detail.Team.CreatedAt); err != nil {
		return TeamDetail{}, fmt.Errorf("get team detail: %w", err)
	}

	members, err := r.db.Query(ctx, `
		SELECT u.id::text, u.email, u.name, tm.role, tm.status, tm.created_at
		FROM team_members tm
		JOIN users u ON u.id = tm.user_id
		WHERE tm.team_id = $1::uuid
		ORDER BY tm.created_at DESC
	`, id)
	if err != nil {
		return TeamDetail{}, fmt.Errorf("list team members: %w", err)
	}
	defer members.Close()

	for members.Next() {
		var row TeamMemberRow
		if err := members.Scan(&row.UserID, &row.Email, &row.Name, &row.Role, &row.Status, &row.CreatedAt); err != nil {
			return TeamDetail{}, fmt.Errorf("scan team member: %w", err)
		}
		detail.Members = append(detail.Members, row)
	}
	if err := members.Err(); err != nil {
		return TeamDetail{}, err
	}

	walletRows, err := r.db.Query(ctx, `
		SELECT w.id::text, w.team_id::text, t.name, w.currency, w.balance, w.status, w.updated_at
		FROM wallets w
		JOIN teams t ON t.id = w.team_id
		WHERE w.team_id = $1::uuid
		ORDER BY w.updated_at DESC
	`, id)
	if err != nil {
		return TeamDetail{}, fmt.Errorf("list team wallets: %w", err)
	}
	defer walletRows.Close()

	for walletRows.Next() {
		var row backofficewallets.Row
		if err := walletRows.Scan(&row.ID, &row.TeamID, &row.TeamName, &row.Currency, &row.Balance, &row.Status, &row.UpdatedAt); err != nil {
			return TeamDetail{}, fmt.Errorf("scan team wallet: %w", err)
		}
		detail.Wallets = append(detail.Wallets, row)
	}
	if err := walletRows.Err(); err != nil {
		return TeamDetail{}, err
	}

	smsRows, err := r.db.Query(ctx, `
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
		WHERE s.team_id = $1::uuid
		ORDER BY s.created_at DESC
		LIMIT 25
	`, id)
	if err != nil {
		return TeamDetail{}, fmt.Errorf("list team sms messages: %w", err)
	}
	defer smsRows.Close()

	for smsRows.Next() {
		var row SMSRow
		if err := smsRows.Scan(&row.ID, &row.TeamName, &row.ToNumber, &row.FromName, &row.Status, &row.ProviderID, &row.ErrorMessage, &row.CreatedAt); err != nil {
			return TeamDetail{}, fmt.Errorf("scan team sms message: %w", err)
		}
		detail.SMS = append(detail.SMS, row)
	}
	if err := smsRows.Err(); err != nil {
		return TeamDetail{}, err
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
