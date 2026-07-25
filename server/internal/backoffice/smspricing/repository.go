package smspricing

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

func (r *Repository) List(ctx context.Context) ([]PlanRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			p.id::text,
			p.name,
			p.currency,
			p.is_default,
			p.status,
			COALESCE(current_rates.country_count, 0),
			p.created_at,
			p.updated_at
		FROM sms_pricing_plans p
		LEFT JOIN LATERAL (
			SELECT count(DISTINCT destination_country) AS country_count
			FROM sms_pricing_rules
			WHERE pricing_plan_id = p.id
			  AND status = 'active'
			  AND effective_from <= now()
			  AND (effective_until IS NULL OR effective_until > now())
		) current_rates ON true
		ORDER BY p.is_default DESC, p.status, p.name
	`)
	if err != nil {
		return nil, fmt.Errorf("list sms pricing plans: %w", err)
	}
	defer rows.Close()

	plans := make([]PlanRow, 0)
	for rows.Next() {
		var plan PlanRow
		if err := rows.Scan(
			&plan.ID,
			&plan.Name,
			&plan.Currency,
			&plan.IsDefault,
			&plan.Status,
			&plan.CurrentCountryCount,
			&plan.CreatedAt,
			&plan.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan sms pricing plan: %w", err)
		}
		plans = append(plans, plan)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate sms pricing plans: %w", err)
	}
	return plans, nil
}

func (r *Repository) Detail(ctx context.Context, id string) (PlanDetail, error) {
	var detail PlanDetail
	if err := r.db.QueryRow(ctx, `
		SELECT
			p.id::text,
			p.name,
			p.currency,
			p.is_default,
			p.status,
			COALESCE(current_rates.country_count, 0),
			p.created_at,
			p.updated_at
		FROM sms_pricing_plans p
		LEFT JOIN LATERAL (
			SELECT count(DISTINCT destination_country) AS country_count
			FROM sms_pricing_rules
			WHERE pricing_plan_id = p.id
			  AND status = 'active'
			  AND effective_from <= now()
			  AND (effective_until IS NULL OR effective_until > now())
		) current_rates ON true
		WHERE p.id = $1::uuid
	`, id).Scan(
		&detail.Plan.ID,
		&detail.Plan.Name,
		&detail.Plan.Currency,
		&detail.Plan.IsDefault,
		&detail.Plan.Status,
		&detail.Plan.CurrentCountryCount,
		&detail.Plan.CreatedAt,
		&detail.Plan.UpdatedAt,
	); err != nil {
		return PlanDetail{}, fmt.Errorf("get sms pricing plan: %w", err)
	}

	rows, err := r.db.Query(ctx, `
		SELECT id::text, destination_country, unit_cost_micros, effective_from,
		       effective_until, status, created_at
		FROM sms_pricing_rules
		WHERE pricing_plan_id = $1::uuid
		ORDER BY destination_country, effective_from DESC, created_at DESC
	`, id)
	if err != nil {
		return PlanDetail{}, fmt.Errorf("list sms pricing rates: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var rate RateRow
		if err := rows.Scan(
			&rate.ID,
			&rate.DestinationCountry,
			&rate.UnitCostMicros,
			&rate.EffectiveFrom,
			&rate.EffectiveUntil,
			&rate.Status,
			&rate.CreatedAt,
		); err != nil {
			return PlanDetail{}, fmt.Errorf("scan sms pricing rate: %w", err)
		}
		detail.Rates = append(detail.Rates, rate)
	}
	if err := rows.Err(); err != nil {
		return PlanDetail{}, fmt.Errorf("iterate sms pricing rates: %w", err)
	}
	return detail, nil
}

func (r *Repository) ListActivePlans(ctx context.Context) ([]PlanOption, error) {
	rows, err := r.db.Query(ctx, `
		SELECT id::text, name, is_default
		FROM sms_pricing_plans
		WHERE status = 'active'
		ORDER BY is_default DESC, name
	`)
	if err != nil {
		return nil, fmt.Errorf("list active sms pricing plans: %w", err)
	}
	defer rows.Close()

	plans := make([]PlanOption, 0)
	for rows.Next() {
		var plan PlanOption
		if err := rows.Scan(&plan.ID, &plan.Name, &plan.IsDefault); err != nil {
			return nil, fmt.Errorf("scan active sms pricing plan: %w", err)
		}
		plans = append(plans, plan)
	}
	return plans, rows.Err()
}

func (r *Repository) TeamConfiguration(ctx context.Context, teamID string) (TeamConfiguration, error) {
	var config TeamConfiguration
	if err := r.db.QueryRow(ctx, `
		SELECT
			t.id::text,
			COALESCE(settings.pricing_plan_id, default_plan.id)::text,
			COALESCE(assigned_plan.name, default_plan.name),
			settings.team_id IS NOT NULL,
			settings.updated_at
		FROM teams t
		CROSS JOIN LATERAL (
			SELECT id, name
			FROM sms_pricing_plans
			WHERE is_default = true AND status = 'active'
			ORDER BY created_at
			LIMIT 1
		) default_plan
		LEFT JOIN team_sms_settings settings ON settings.team_id = t.id
		LEFT JOIN sms_pricing_plans assigned_plan ON assigned_plan.id = settings.pricing_plan_id
		WHERE t.id = $1::uuid
	`, teamID).Scan(
		&config.TeamID,
		&config.PricingPlanID,
		&config.PricingPlanName,
		&config.Explicit,
		&config.UpdatedAt,
	); err != nil {
		return TeamConfiguration{}, fmt.Errorf("get team sms pricing configuration: %w", err)
	}
	return config, nil
}
