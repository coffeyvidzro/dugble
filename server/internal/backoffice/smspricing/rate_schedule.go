package smspricing

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

// ScheduleRate appends a new effective-dated rate. An earlier open-ended rate
// for the same plan and traffic class is closed at the new start time so price
// changes can be scheduled without editing historical unit prices.
func (r *Repository) ScheduleRate(
	ctx context.Context,
	planID string,
	trafficClass string,
	unitCostMicros int64,
	effectiveFrom time.Time,
	effectiveUntil *time.Time,
) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin schedule sms pricing rate: %w", err)
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
			  AND NOT (effective_until IS NULL AND effective_from < $3::timestamptz)
		)
	`, planID, trafficClass, effectiveFrom, effectiveUntil).Scan(&overlaps); err != nil {
		return fmt.Errorf("check overlapping sms pricing rate: %w", err)
	}
	if overlaps {
		return ErrRateOverlap
	}

	if _, err := tx.Exec(ctx, `
		UPDATE sms_pricing_rules
		SET effective_until = $3,
			updated_at = now()
		WHERE pricing_plan_id = $1::uuid
		  AND traffic_class = $2
		  AND status = 'active'
		  AND effective_until IS NULL
		  AND effective_from < $3
	`, planID, trafficClass, effectiveFrom); err != nil {
		return fmt.Errorf("close previous sms pricing rate: %w", err)
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
		return fmt.Errorf("schedule sms pricing rate: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit scheduled sms pricing rate: %w", err)
	}
	return nil
}
