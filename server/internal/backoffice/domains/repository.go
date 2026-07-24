package domains

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) List(ctx context.Context, filter Filter) ([]Row, error) {
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

	var domains []Row
	for rows.Next() {
		var row Row
		if err := rows.Scan(&row.ID, &row.TeamName, &row.Domain, &row.Provider, &row.Status, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan domain: %w", err)
		}
		domains = append(domains, row)
	}

	return domains, rows.Err()
}

func (r *Repository) Verify(ctx context.Context, id string) error {
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
		return fmt.Errorf("verify sender domain: %w", pgx.ErrNoRows)
	}

	return nil
}

func (r *Repository) Fail(ctx context.Context, id string, reason string) error {
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
		return fmt.Errorf("fail sender domain: %w", pgx.ErrNoRows)
	}

	return nil
}
