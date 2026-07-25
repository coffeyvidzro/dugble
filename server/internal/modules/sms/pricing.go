package sms

import (
	"context"
	"errors"
	"fmt"
	"math"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

var ErrSMSPricingNotConfigured = errors.New("sms pricing is not configured")

type PricingQuote struct {
	PricingPlanID     uuid.UUID
	PricingPlanName   string
	PricingRuleID     uuid.UUID
	DestinationCountry string
	Currency          string
	UnitCostMicros    int64
	TotalCostMicros   int64
}

type teamPricingSettings struct {
	PricingPlanID uuid.UUID
}

const getTeamPricingSettingsQuery = `
SELECT COALESCE(settings.pricing_plan_id, default_plan.id)
FROM teams
CROSS JOIN LATERAL (
    SELECT id
    FROM sms_pricing_plans
    WHERE is_default = true
      AND status = 'active'
    ORDER BY created_at ASC
    LIMIT 1
) AS default_plan
LEFT JOIN team_sms_settings AS settings
    ON settings.team_id = teams.id
WHERE teams.id = $1
  AND teams.status = 'active'
`

const getActivePricingRuleQuery = `
SELECT
    plan.id,
    plan.name,
    plan.currency,
    rule.id,
    rule.unit_cost_micros
FROM sms_pricing_rules AS rule
JOIN sms_pricing_plans AS plan
    ON plan.id = rule.pricing_plan_id
WHERE rule.pricing_plan_id = $1
  AND rule.destination_country = $2
  AND rule.status = 'active'
  AND plan.status = 'active'
  AND rule.effective_from <= now()
  AND (rule.effective_until IS NULL OR rule.effective_until > now())
ORDER BY rule.effective_from DESC, rule.created_at DESC
LIMIT 1
`

// QuoteSMS resolves the team's pricing plan and the current destination-country
// rate. Call it on a transaction-bound repository so the quote, message
// snapshot, and wallet debit remain consistent.
func (r *Repository) QuoteSMS(
	ctx context.Context,
	teamID uuid.UUID,
	destinationCountry string,
	segments int32,
) (PricingQuote, error) {
	if segments <= 0 {
		return PricingQuote{}, fmt.Errorf("quote sms: segments must be positive")
	}

	destinationCountry = smsapi.NormalizeCountryCode(destinationCountry)
	if !smsapi.IsCountryCode(destinationCountry) {
		return PricingQuote{}, fmt.Errorf("%w: invalid destination country", ErrSMSPricingNotConfigured)
	}

	settings, err := r.getTeamPricingSettings(ctx, teamID)
	if err != nil {
		return PricingQuote{}, err
	}
	quote, err := r.getActivePricingRule(ctx, settings.PricingPlanID, destinationCountry)
	if err != nil {
		return PricingQuote{}, err
	}
	if quote.UnitCostMicros > math.MaxInt64/int64(segments) {
		return PricingQuote{}, fmt.Errorf("quote sms: total price overflows int64")
	}
	quote.DestinationCountry = destinationCountry
	quote.TotalCostMicros = quote.UnitCostMicros * int64(segments)
	return quote, nil
}

func (r *Repository) getTeamPricingSettings(ctx context.Context, teamID uuid.UUID) (teamPricingSettings, error) {
	var settings teamPricingSettings
	err := r.dbtx.QueryRow(ctx, getTeamPricingSettingsQuery, teamID).Scan(&settings.PricingPlanID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return teamPricingSettings{}, ErrSMSPricingNotConfigured
		}
		return teamPricingSettings{}, fmt.Errorf("get team sms pricing settings: %w", err)
	}
	return settings, nil
}

func (r *Repository) getActivePricingRule(
	ctx context.Context,
	pricingPlanID uuid.UUID,
	destinationCountry string,
) (PricingQuote, error) {
	var quote PricingQuote
	err := r.dbtx.QueryRow(ctx, getActivePricingRuleQuery, pricingPlanID, destinationCountry).Scan(
		&quote.PricingPlanID,
		&quote.PricingPlanName,
		&quote.Currency,
		&quote.PricingRuleID,
		&quote.UnitCostMicros,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return PricingQuote{}, ErrSMSPricingNotConfigured
		}
		return PricingQuote{}, fmt.Errorf("get active sms pricing rule: %w", err)
	}
	return quote, nil
}
