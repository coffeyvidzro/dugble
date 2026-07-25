package smspricing

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

func (r *Repository) CreateManagedPlan(ctx context.Context, name string, actor Actor) (string, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return "", fmt.Errorf("begin create sms pricing plan: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var id string
	if err := tx.QueryRow(ctx, `
		INSERT INTO sms_pricing_plans (name, currency, is_default, status)
		VALUES ($1, 'USD', false, 'active')
		RETURNING id::text
	`, name).Scan(&id); err != nil {
		return "", fmt.Errorf("create sms pricing plan: %w", err)
	}
	if err := auditPricingChange(ctx, tx, actor, "plan.created", "plan", id, map[string]any{"name": name}); err != nil {
		return "", err
	}
	if err := tx.Commit(ctx); err != nil {
		return "", fmt.Errorf("commit create sms pricing plan: %w", err)
	}
	return id, nil
}

func (r *Repository) RenamePlan(ctx context.Context, id string, name string, actor Actor) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin rename sms pricing plan: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var previousName string
	if err := tx.QueryRow(ctx, `
		SELECT name FROM sms_pricing_plans WHERE id = $1::uuid FOR UPDATE
	`, id).Scan(&previousName); err != nil {
		return fmt.Errorf("get sms pricing plan for rename: %w", err)
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_plans SET name = $2, updated_at = now() WHERE id = $1::uuid
	`, id, name); err != nil {
		return fmt.Errorf("rename sms pricing plan: %w", err)
	}
	if err := auditPricingChange(ctx, tx, actor, "plan.renamed", "plan", id, map[string]any{
		"previous_name": previousName,
		"name":          name,
	}); err != nil {
		return err
	}
	return commitPricingTx(ctx, tx, "rename sms pricing plan")
}

func (r *Repository) SetManagedDefault(ctx context.Context, id string, actor Actor) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin set default sms pricing plan: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if err := ensureActivePlan(ctx, tx, id); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_plans SET is_default = false, updated_at = now() WHERE is_default = true
	`); err != nil {
		return fmt.Errorf("clear default sms pricing plan: %w", err)
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_plans SET is_default = true, updated_at = now() WHERE id = $1::uuid
	`, id); err != nil {
		return fmt.Errorf("set default sms pricing plan: %w", err)
	}
	if err := auditPricingChange(ctx, tx, actor, "plan.defaulted", "plan", id, nil); err != nil {
		return err
	}
	return commitPricingTx(ctx, tx, "set default sms pricing plan")
}

func (r *Repository) SetPlanStatus(ctx context.Context, id string, status string, actor Actor) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin update sms pricing plan status: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var isDefault bool
	var currentStatus string
	if err := tx.QueryRow(ctx, `
		SELECT is_default, status FROM sms_pricing_plans WHERE id = $1::uuid FOR UPDATE
	`, id).Scan(&isDefault, &currentStatus); err != nil {
		return fmt.Errorf("get sms pricing plan status: %w", err)
	}
	if status == "archived" {
		if isDefault {
			return ErrDefaultPlan
		}
		var assigned bool
		if err := tx.QueryRow(ctx, `
			SELECT EXISTS (SELECT 1 FROM team_sms_settings WHERE pricing_plan_id = $1::uuid)
		`, id).Scan(&assigned); err != nil {
			return fmt.Errorf("check assigned teams: %w", err)
		}
		if assigned {
			return ErrPlanInUse
		}
	}
	if currentStatus == status {
		return nil
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_plans SET status = $2, updated_at = now() WHERE id = $1::uuid
	`, id, status); err != nil {
		return fmt.Errorf("update sms pricing plan status: %w", err)
	}
	if err := auditPricingChange(ctx, tx, actor, "plan."+status, "plan", id, map[string]any{
		"previous_status": currentStatus,
	}); err != nil {
		return err
	}
	return commitPricingTx(ctx, tx, "update sms pricing plan status")
}

func (r *Repository) DeleteUnusedPlan(ctx context.Context, id string, actor Actor) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin delete sms pricing plan: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var name string
	var isDefault bool
	if err := tx.QueryRow(ctx, `
		SELECT name, is_default FROM sms_pricing_plans WHERE id = $1::uuid FOR UPDATE
	`, id).Scan(&name, &isDefault); err != nil {
		return fmt.Errorf("get sms pricing plan for deletion: %w", err)
	}
	if isDefault {
		return ErrDefaultPlan
	}
	var used bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (SELECT 1 FROM team_sms_settings WHERE pricing_plan_id = $1::uuid)
		    OR EXISTS (SELECT 1 FROM sms_pricing_rules WHERE pricing_plan_id = $1::uuid)
	`, id).Scan(&used); err != nil {
		return fmt.Errorf("check sms pricing plan usage: %w", err)
	}
	if used {
		return ErrPlanInUse
	}
	if err := auditPricingChange(ctx, tx, actor, "plan.deleted", "plan", id, map[string]any{"name": name}); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `DELETE FROM sms_pricing_plans WHERE id = $1::uuid`, id); err != nil {
		return fmt.Errorf("delete sms pricing plan: %w", err)
	}
	return commitPricingTx(ctx, tx, "delete sms pricing plan")
}

func (r *Repository) PlanUsage(ctx context.Context, id string) (int64, int64, error) {
	var teams int64
	var rates int64
	if err := r.db.QueryRow(ctx, `
		SELECT
			(SELECT count(*) FROM team_sms_settings WHERE pricing_plan_id = $1::uuid),
			(SELECT count(*) FROM sms_pricing_rules WHERE pricing_plan_id = $1::uuid)
	`, id).Scan(&teams, &rates); err != nil {
		return 0, 0, fmt.Errorf("get sms pricing plan usage: %w", err)
	}
	return teams, rates, nil
}

func (r *Repository) CurrentRate(ctx context.Context, planID string, country string) (int64, bool, error) {
	var micros int64
	err := r.db.QueryRow(ctx, `
		SELECT unit_cost_micros
		FROM sms_pricing_rules
		WHERE pricing_plan_id = $1::uuid
		  AND destination_country = $2
		  AND status = 'active'
		  AND effective_from <= now()
		  AND (effective_until IS NULL OR effective_until > now())
		ORDER BY effective_from DESC, created_at DESC
		LIMIT 1
	`, planID, country).Scan(&micros)
	if err == pgx.ErrNoRows {
		return 0, false, nil
	}
	if err != nil {
		return 0, false, fmt.Errorf("get current sms pricing rate: %w", err)
	}
	return micros, true, nil
}

func (r *Repository) CurrentRateCount(ctx context.Context, planID string) (int64, error) {
	var count int64
	if err := r.db.QueryRow(ctx, `
		SELECT count(DISTINCT destination_country)
		FROM sms_pricing_rules
		WHERE pricing_plan_id = $1::uuid
		  AND status = 'active'
		  AND effective_from <= now()
		  AND (effective_until IS NULL OR effective_until > now())
	`, planID).Scan(&count); err != nil {
		return 0, fmt.Errorf("count current sms pricing rates: %w", err)
	}
	return count, nil
}

func (r *Repository) ScheduleManagedRate(
	ctx context.Context,
	planID string,
	country string,
	unitCostMicros int64,
	effectiveFrom time.Time,
	effectiveUntil *time.Time,
	actor Actor,
) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin schedule sms pricing rate: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if err := ensureActivePlan(ctx, tx, planID); err != nil {
		return err
	}
	if err := ensureNoRateOverlap(ctx, tx, planID, country, "", effectiveFrom, effectiveUntil); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_rules
		SET effective_until = $3, updated_at = now()
		WHERE pricing_plan_id = $1::uuid
		  AND destination_country = $2
		  AND status = 'active'
		  AND effective_until IS NULL
		  AND effective_from < $3
	`, planID, country, effectiveFrom); err != nil {
		return fmt.Errorf("close previous sms pricing rate: %w", err)
	}

	var rateID string
	if err := tx.QueryRow(ctx, `
		INSERT INTO sms_pricing_rules (
			pricing_plan_id, destination_country, unit_cost_micros,
			effective_from, effective_until, status
		) VALUES ($1::uuid, $2, $3, $4, $5, 'active')
		RETURNING id::text
	`, planID, country, unitCostMicros, effectiveFrom, effectiveUntil).Scan(&rateID); err != nil {
		return fmt.Errorf("schedule sms pricing rate: %w", err)
	}
	if err := auditPricingChange(ctx, tx, actor, "rate.scheduled", "rate", rateID, map[string]any{
		"plan_id": planID, "destination_country": country, "unit_cost_micros": unitCostMicros,
		"effective_from": effectiveFrom, "effective_until": effectiveUntil,
	}); err != nil {
		return err
	}
	return commitPricingTx(ctx, tx, "schedule sms pricing rate")
}

func (r *Repository) UpdateScheduledRate(
	ctx context.Context,
	planID string,
	rateID string,
	unitCostMicros int64,
	effectiveFrom time.Time,
	effectiveUntil *time.Time,
	actor Actor,
) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin update scheduled sms pricing rate: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var country string
	var previousFrom time.Time
	var previousUntil *time.Time
	var status string
	if err := tx.QueryRow(ctx, `
		SELECT destination_country, effective_from, effective_until, status
		FROM sms_pricing_rules
		WHERE id = $1::uuid AND pricing_plan_id = $2::uuid
		FOR UPDATE
	`, rateID, planID).Scan(&country, &previousFrom, &previousUntil, &status); err != nil {
		return fmt.Errorf("get scheduled sms pricing rate: %w", err)
	}
	if status != "active" || !previousFrom.After(time.Now().UTC()) {
		return ErrRateImmutable
	}

	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_rules
		SET effective_until = NULL, updated_at = now()
		WHERE pricing_plan_id = $1::uuid
		  AND destination_country = $2
		  AND status = 'active'
		  AND effective_until = $3
		  AND effective_from < $3
	`, planID, country, previousFrom); err != nil {
		return fmt.Errorf("reopen predecessor sms pricing rate: %w", err)
	}
	if err := ensureNoRateOverlap(ctx, tx, planID, country, rateID, effectiveFrom, effectiveUntil); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_rules
		SET effective_until = $3, updated_at = now()
		WHERE pricing_plan_id = $1::uuid
		  AND destination_country = $2
		  AND status = 'active'
		  AND effective_until IS NULL
		  AND effective_from < $3
		  AND id <> $4::uuid
	`, planID, country, effectiveFrom, rateID); err != nil {
		return fmt.Errorf("close predecessor sms pricing rate: %w", err)
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_rules
		SET unit_cost_micros = $3, effective_from = $4,
			effective_until = $5, updated_at = now()
		WHERE id = $1::uuid AND pricing_plan_id = $2::uuid
	`, rateID, planID, unitCostMicros, effectiveFrom, effectiveUntil); err != nil {
		return fmt.Errorf("update scheduled sms pricing rate: %w", err)
	}
	if err := auditPricingChange(ctx, tx, actor, "rate.updated", "rate", rateID, map[string]any{
		"plan_id": planID, "destination_country": country, "unit_cost_micros": unitCostMicros,
		"effective_from": effectiveFrom, "effective_until": effectiveUntil,
		"previous_effective_from": previousFrom, "previous_effective_until": previousUntil,
	}); err != nil {
		return err
	}
	return commitPricingTx(ctx, tx, "update scheduled sms pricing rate")
}

func (r *Repository) CancelScheduledRate(ctx context.Context, planID string, rateID string, actor Actor) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin cancel scheduled sms pricing rate: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var country string
	var effectiveFrom time.Time
	var status string
	if err := tx.QueryRow(ctx, `
		SELECT destination_country, effective_from, status
		FROM sms_pricing_rules
		WHERE id = $1::uuid AND pricing_plan_id = $2::uuid
		FOR UPDATE
	`, rateID, planID).Scan(&country, &effectiveFrom, &status); err != nil {
		return fmt.Errorf("get scheduled sms pricing rate: %w", err)
	}
	if status != "active" || !effectiveFrom.After(time.Now().UTC()) {
		return ErrRateImmutable
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_rules SET status = 'archived', updated_at = now() WHERE id = $1::uuid
	`, rateID); err != nil {
		return fmt.Errorf("archive scheduled sms pricing rate: %w", err)
	}
	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_rules
		SET effective_until = NULL, updated_at = now()
		WHERE pricing_plan_id = $1::uuid
		  AND destination_country = $2
		  AND status = 'active'
		  AND effective_until = $3
		  AND effective_from < $3
	`, planID, country, effectiveFrom); err != nil {
		return fmt.Errorf("restore predecessor sms pricing rate: %w", err)
	}
	if err := auditPricingChange(ctx, tx, actor, "rate.cancelled", "rate", rateID, map[string]any{
		"plan_id": planID, "destination_country": country, "effective_from": effectiveFrom,
	}); err != nil {
		return err
	}
	return commitPricingTx(ctx, tx, "cancel scheduled sms pricing rate")
}

func (r *Repository) UpdateManagedTeam(ctx context.Context, teamID string, req UpdateTeamRequest, actor Actor) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin update team sms pricing: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if err := validateTeamPricingTx(ctx, tx, teamID, req); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO team_sms_settings (team_id, pricing_plan_id)
		VALUES ($1::uuid, $2::uuid)
		ON CONFLICT (team_id) DO UPDATE SET
			pricing_plan_id = EXCLUDED.pricing_plan_id,
			updated_at = now()
	`, teamID, req.PricingPlanID); err != nil {
		return fmt.Errorf("update team sms pricing: %w", err)
	}
	if err := auditPricingChange(ctx, tx, actor, "team_settings.updated", "team_settings", teamID, map[string]any{
		"pricing_plan_id": req.PricingPlanID,
	}); err != nil {
		return err
	}
	return commitPricingTx(ctx, tx, "update team sms pricing")
}

func (r *Repository) ResetManagedTeam(ctx context.Context, teamID string, actor Actor) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin reset team sms pricing: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	tag, err := tx.Exec(ctx, `DELETE FROM team_sms_settings WHERE team_id = $1::uuid`, teamID)
	if err != nil {
		return fmt.Errorf("reset team sms pricing: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	if err := auditPricingChange(ctx, tx, actor, "team_settings.reset", "team_settings", teamID, nil); err != nil {
		return err
	}
	return commitPricingTx(ctx, tx, "reset team sms pricing")
}

func ensureActivePlan(ctx context.Context, tx pgx.Tx, planID string) error {
	var active bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (SELECT 1 FROM sms_pricing_plans WHERE id = $1::uuid AND status = 'active')
	`, planID).Scan(&active); err != nil {
		return fmt.Errorf("check sms pricing plan: %w", err)
	}
	if !active {
		return ErrPlanUnavailable
	}
	return nil
}

func ensureNoRateOverlap(
	ctx context.Context,
	tx pgx.Tx,
	planID string,
	country string,
	excludeRateID string,
	effectiveFrom time.Time,
	effectiveUntil *time.Time,
) error {
	var overlaps bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM sms_pricing_rules
			WHERE pricing_plan_id = $1::uuid
			  AND destination_country = $2
			  AND status = 'active'
			  AND (NULLIF($5, '') IS NULL OR id <> NULLIF($5, '')::uuid)
			  AND effective_from < COALESCE($4::timestamptz, 'infinity'::timestamptz)
			  AND COALESCE(effective_until, 'infinity'::timestamptz) > $3::timestamptz
			  AND NOT (effective_until IS NULL AND effective_from < $3::timestamptz)
		)
	`, planID, country, effectiveFrom, effectiveUntil, excludeRateID).Scan(&overlaps); err != nil {
		return fmt.Errorf("check overlapping sms pricing rate: %w", err)
	}
	if overlaps {
		return ErrRateOverlap
	}
	return nil
}

func validateTeamPricingTx(ctx context.Context, tx pgx.Tx, teamID string, req UpdateTeamRequest) error {
	var teamExists bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS (SELECT 1 FROM teams WHERE id = $1::uuid)`, teamID).Scan(&teamExists); err != nil {
		return fmt.Errorf("check team: %w", err)
	}
	if !teamExists {
		return pgx.ErrNoRows
	}
	if err := ensureActivePlan(ctx, tx, req.PricingPlanID); err != nil {
		return err
	}
	var hasCurrentRate bool
	if err := tx.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1 FROM sms_pricing_rules
			WHERE pricing_plan_id = $1::uuid
			  AND status = 'active'
			  AND effective_from <= now()
			  AND (effective_until IS NULL OR effective_until > now())
		)
	`, req.PricingPlanID).Scan(&hasCurrentRate); err != nil {
		return fmt.Errorf("check assigned sms pricing rates: %w", err)
	}
	if !hasCurrentRate {
		return ErrNoCurrentRate
	}
	return nil
}

func auditPricingChange(
	ctx context.Context,
	tx pgx.Tx,
	actor Actor,
	action string,
	resourceType string,
	resourceID string,
	metadata any,
) error {
	if actor.Email == "" {
		actor.Email = "unknown-admin"
	}
	payload, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("encode sms pricing audit metadata: %w", err)
	}
	if metadata == nil {
		payload = []byte("{}")
	}
	if _, err := tx.Exec(ctx, `
		INSERT INTO sms_pricing_audit_log (
			actor_user_id, actor_email, action, resource_type, resource_id, metadata
		) VALUES (NULLIF($1, '')::uuid, $2, $3, $4, NULLIF($5, '')::uuid, $6::jsonb)
	`, actor.UserID, actor.Email, action, resourceType, resourceID, string(payload)); err != nil {
		return fmt.Errorf("record sms pricing audit log: %w", err)
	}
	return nil
}

func commitPricingTx(ctx context.Context, tx pgx.Tx, action string) error {
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit %s: %w", action, err)
	}
	return nil
}
