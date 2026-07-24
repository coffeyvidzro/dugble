package smspricing

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
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
			COALESCE(local_rule.unit_cost_micros, 0),
			local_rule.unit_cost_micros IS NOT NULL,
			COALESCE(a2p_rule.unit_cost_micros, 0),
			a2p_rule.unit_cost_micros IS NOT NULL,
			p.created_at,
			p.updated_at
		FROM sms_pricing_plans p
		LEFT JOIN LATERAL (
			SELECT unit_cost_micros
			FROM sms_pricing_rules
			WHERE pricing_plan_id = p.id
			  AND traffic_class = 'local'
			  AND status = 'active'
			  AND effective_from <= now()
			  AND (effective_until IS NULL OR effective_until > now())
			ORDER BY effective_from DESC, created_at DESC
			LIMIT 1
		) local_rule ON true
		LEFT JOIN LATERAL (
			SELECT unit_cost_micros
			FROM sms_pricing_rules
			WHERE pricing_plan_id = p.id
			  AND traffic_class = 'a2p'
			  AND status = 'active'
			  AND effective_from <= now()
			  AND (effective_until IS NULL OR effective_until > now())
			ORDER BY effective_from DESC, created_at DESC
			LIMIT 1
		) a2p_rule ON true
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
			&plan.LocalRateMicros,
			&plan.HasCurrentLocalRate,
			&plan.A2PRateMicros,
			&plan.HasCurrentA2PRate,
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
			COALESCE(local_rule.unit_cost_micros, 0),
			local_rule.unit_cost_micros IS NOT NULL,
			COALESCE(a2p_rule.unit_cost_micros, 0),
			a2p_rule.unit_cost_micros IS NOT NULL,
			p.created_at,
			p.updated_at
		FROM sms_pricing_plans p
		LEFT JOIN LATERAL (
			SELECT unit_cost_micros
			FROM sms_pricing_rules
			WHERE pricing_plan_id = p.id
			  AND traffic_class = 'local'
			  AND status = 'active'
			  AND effective_from <= now()
			  AND (effective_until IS NULL OR effective_until > now())
			ORDER BY effective_from DESC, created_at DESC
			LIMIT 1
		) local_rule ON true
		LEFT JOIN LATERAL (
			SELECT unit_cost_micros
			FROM sms_pricing_rules
			WHERE pricing_plan_id = p.id
			  AND traffic_class = 'a2p'
			  AND status = 'active'
			  AND effective_from <= now()
			  AND (effective_until IS NULL OR effective_until > now())
			ORDER BY effective_from DESC, created_at DESC
			LIMIT 1
		) a2p_rule ON true
		WHERE p.id = $1::uuid
	`, id).Scan(
		&detail.Plan.ID,
		&detail.Plan.Name,
		&detail.Plan.Currency,
		&detail.Plan.IsDefault,
		&detail.Plan.Status,
		&detail.Plan.LocalRateMicros,
		&detail.Plan.HasCurrentLocalRate,
		&detail.Plan.A2PRateMicros,
		&detail.Plan.HasCurrentA2PRate,
		&detail.Plan.CreatedAt,
		&detail.Plan.UpdatedAt,
	); err != nil {
		return PlanDetail{}, fmt.Errorf("get sms pricing plan: %w", err)
	}

	rows, err := r.db.Query(ctx, `
		SELECT id::text, traffic_class, unit_cost_micros, effective_from,
		       effective_until, status, created_at
		FROM sms_pricing_rules
		WHERE pricing_plan_id = $1::uuid
		ORDER BY traffic_class, effective_from DESC, created_at DESC
	`, id)
	if err != nil {
		return PlanDetail{}, fmt.Errorf("list sms pricing rates: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var rate RateRow
		if err := rows.Scan(
			&rate.ID,
			&rate.TrafficClass,
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

func (r *Repository) CreatePlan(ctx context.Context, name string, makeDefault bool) (string, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return "", fmt.Errorf("begin create sms pricing plan: %w", err)
	}
	defer tx.Rollback(ctx)

	if makeDefault {
		if _, err := tx.Exec(ctx, `
			UPDATE sms_pricing_plans
			SET is_default = false, updated_at = now()
			WHERE is_default = true
		`); err != nil {
			return "", fmt.Errorf("clear default sms pricing plan: %w", err)
		}
	}

	var id string
	if err := tx.QueryRow(ctx, `
		INSERT INTO sms_pricing_plans (name, currency, is_default, status)
		VALUES ($1, 'USD', $2, 'active')
		RETURNING id::text
	`, name, makeDefault).Scan(&id); err != nil {
		return "", fmt.Errorf("create sms pricing plan: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return "", fmt.Errorf("commit create sms pricing plan: %w", err)
	}
	return id, nil
}

func (r *Repository) SetDefault(ctx context.Context, id string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin set default sms pricing plan: %w", err)
	}
	defer tx.Rollback(ctx)

	var exists bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM sms_pricing_plans
			WHERE id = $1::uuid AND status = 'active'
		)
	`, id).Scan(&exists); err != nil {
		return fmt.Errorf("check sms pricing plan: %w", err)
	}
	if !exists {
		return pgx.ErrNoRows
	}

	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_plans
		SET is_default = false, updated_at = now()
		WHERE is_default = true
	`); err != nil {
		return fmt.Errorf("clear default sms pricing plan: %w", err)
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_plans
		SET is_default = true, updated_at = now()
		WHERE id = $1::uuid
	`, id); err != nil {
		return fmt.Errorf("set default sms pricing plan: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit default sms pricing plan: %w", err)
	}
	return nil
}

func (r *Repository) AddRate(
	ctx context.Context,
	planID string,
	trafficClass string,
	unitCostMicros int64,
	effectiveFrom time.Time,
	effectiveUntil *time.Time,
) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin add sms pricing rate: %w", err)
	}
	defer tx.Rollback(ctx)

	var planActive bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM sms_pricing_plans
			WHERE id = $1::uuid AND status = 'active'
		)
	`, planID).Scan(&planActive); err != nil {
		return fmt.Errorf("check sms pricing plan: %w", err)
	}
	if !planActive {
		return pgx.ErrNoRows
	}

	var overlaps bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM sms_pricing_rules
			WHERE pricing_plan_id = $1::uuid
			  AND traffic_class = $2
			  AND status = 'active'
			  AND effective_from < COALESCE($4::timestamptz, 'infinity'::timestamptz)
			  AND COALESCE(effective_until, 'infinity'::timestamptz) > $3::timestamptz
		)
	`, planID, trafficClass, effectiveFrom, effectiveUntil).Scan(&overlaps); err != nil {
		return fmt.Errorf("check overlapping sms pricing rate: %w", err)
	}
	if overlaps {
		return ErrRateOverlap
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO sms_pricing_rules (
			pricing_plan_id,
			traffic_class,
			unit_cost_micros,
			effective_from,
			effective_until,
			status
		) VALUES ($1::uuid, $2, $3, $4, $5, 'active')
	`, planID, trafficClass, unitCostMicros, effectiveFrom, effectiveUntil); err != nil {
		return fmt.Errorf("add sms pricing rate: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit sms pricing rate: %w", err)
	}
	return nil
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
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate active sms pricing plans: %w", err)
	}
	return plans, nil
}

func (r *Repository) TeamConfiguration(ctx context.Context, teamID string) (TeamConfiguration, error) {
	var config TeamConfiguration
	if err := r.db.QueryRow(ctx, `
		WITH default_plan AS (
			SELECT id
			FROM sms_pricing_plans
			WHERE is_default = true AND status = 'active'
			ORDER BY created_at
			LIMIT 1
		)
		SELECT
			t.id::text,
			p.id::text,
			p.name,
			COALESCE(settings.default_traffic_class, 'a2p'),
			COALESCE(settings.local_enabled, false),
			COALESCE(settings.a2p_enabled, true),
			settings.team_id IS NOT NULL,
			settings.updated_at
		FROM teams t
		CROSS JOIN default_plan
		LEFT JOIN team_sms_settings settings ON settings.team_id = t.id
		JOIN sms_pricing_plans p
		  ON p.id = COALESCE(settings.pricing_plan_id, default_plan.id)
		WHERE t.id = $1::uuid
	`, teamID).Scan(
		&config.TeamID,
		&config.PricingPlanID,
		&config.PricingPlanName,
		&config.DefaultTrafficClass,
		&config.LocalEnabled,
		&config.A2PEnabled,
		&config.Explicit,
		&config.UpdatedAt,
	); err != nil {
		return TeamConfiguration{}, fmt.Errorf("get team sms pricing configuration: %w", err)
	}
	return config, nil
}

func (r *Repository) UpdateTeam(ctx context.Context, teamID string, req UpdateTeamRequest) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin update team sms pricing: %w", err)
	}
	defer tx.Rollback(ctx)

	var teamExists bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM teams WHERE id = $1::uuid)`, teamID).Scan(&teamExists); err != nil {
		return fmt.Errorf("check team: %w", err)
	}
	if !teamExists {
		return pgx.ErrNoRows
	}

	var planActive bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM sms_pricing_plans
			WHERE id = $1::uuid AND status = 'active'
		)
	`, req.PricingPlanID).Scan(&planActive); err != nil {
		return fmt.Errorf("check assigned sms pricing plan: %w", err)
	}
	if !planActive {
		return ErrPlanUnavailable
	}

	var hasLocalRate bool
	var hasA2PRate bool
	if err := tx.QueryRow(ctx, `
		SELECT
			EXISTS (
				SELECT 1 FROM sms_pricing_rules
				WHERE pricing_plan_id = $1::uuid
				  AND traffic_class = 'local'
				  AND status = 'active'
				  AND effective_from <= now()
				  AND (effective_until IS NULL OR effective_until > now())
			),
			EXISTS (
				SELECT 1 FROM sms_pricing_rules
				WHERE pricing_plan_id = $1::uuid
				  AND traffic_class = 'a2p'
				  AND status = 'active'
				  AND effective_from <= now()
				  AND (effective_until IS NULL OR effective_until > now())
			)
	`, req.PricingPlanID).Scan(&hasLocalRate, &hasA2PRate); err != nil {
		return fmt.Errorf("check assigned sms pricing rates: %w", err)
	}
	if req.LocalEnabled && !hasLocalRate {
		return ErrNoCurrentLocalRate
	}
	if req.A2PEnabled && !hasA2PRate {
		return ErrNoCurrentA2PRate
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO team_sms_settings (
			team_id,
			pricing_plan_id,
			default_traffic_class,
			local_enabled,
			a2p_enabled
		) VALUES ($1::uuid, $2::uuid, $3, $4, $5)
		ON CONFLICT (team_id) DO UPDATE SET
			pricing_plan_id = EXCLUDED.pricing_plan_id,
			default_traffic_class = EXCLUDED.default_traffic_class,
			local_enabled = EXCLUDED.local_enabled,
			a2p_enabled = EXCLUDED.a2p_enabled,
			updated_at = now()
	`, teamID, req.PricingPlanID, req.DefaultTrafficClass, req.LocalEnabled, req.A2PEnabled); err != nil {
		return fmt.Errorf("update team sms pricing: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit team sms pricing: %w", err)
	}
	return nil
}
