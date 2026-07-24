package sms

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

var (
	ErrSMSPricingNotConfigured = errors.New("sms pricing is not configured")
	ErrTrafficClassNotEnabled  = errors.New("sms traffic class is not enabled")
)

type PricingQuote struct {
	PricingPlanID   uuid.UUID
	PricingPlanName string
	PricingRuleID   uuid.UUID
	TrafficClass    string
	Currency        string
	UnitCostMicros  int64
	TotalCostMicros int64
}

type teamPricingSettings struct {
	PricingPlanID       uuid.UUID
	DefaultTrafficClass string
	LocalEnabled        bool
	A2PEnabled          bool
}

const getTeamPricingSettingsQuery = `
SELECT
    COALESCE(settings.pricing_plan_id, default_plan.id),
    COALESCE(settings.default_traffic_class, 'a2p'),
    COALESCE(settings.local_enabled, false),
    COALESCE(settings.a2p_enabled, true)
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
  AND rule.traffic_class = $2
  AND rule.status = 'active'
  AND plan.status = 'active'
  AND rule.effective_from <= now()
  AND (rule.effective_until IS NULL OR rule.effective_until > now())
ORDER BY rule.effective_from DESC, rule.created_at DESC
LIMIT 1
`

// QuoteSMS resolves the team's authorized traffic class and active rate. Call
// it on a transaction-bound repository so the quote, message snapshot, and
// wallet debit remain consistent.
func (r *Repository) QuoteSMS(
	ctx context.Context,
	teamID uuid.UUID,
	requestedTrafficClass string,
	segments int32,
) (PricingQuote, error) {
	if segments <= 0 {
		return PricingQuote{}, fmt.Errorf("quote sms: segments must be positive")
	}

	settings, err := r.getTeamPricingSettings(ctx, teamID)
	if err != nil {
		return PricingQuote{}, err
	}

	trafficClass, err := resolveTrafficClass(settings, requestedTrafficClass)
	if err != nil {
		return PricingQuote{}, err
	}

	quote, err := r.getActivePricingRule(ctx, settings.PricingPlanID, trafficClass)
	if err != nil {
		return PricingQuote{}, err
	}
	if quote.UnitCostMicros > math.MaxInt64/int64(segments) {
		return PricingQuote{}, fmt.Errorf("quote sms: total price overflows int64")
	}
	quote.TrafficClass = trafficClass
	quote.TotalCostMicros = quote.UnitCostMicros * int64(segments)
	return quote, nil
}

func (r *Repository) getTeamPricingSettings(ctx context.Context, teamID uuid.UUID) (teamPricingSettings, error) {
	var settings teamPricingSettings
	err := r.dbtx.QueryRow(ctx, getTeamPricingSettingsQuery, teamID).Scan(
		&settings.PricingPlanID,
		&settings.DefaultTrafficClass,
		&settings.LocalEnabled,
		&settings.A2PEnabled,
	)
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
	trafficClass string,
) (PricingQuote, error) {
	var quote PricingQuote
	err := r.dbtx.QueryRow(ctx, getActivePricingRuleQuery, pricingPlanID, trafficClass).Scan(
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

func resolveTrafficClass(settings teamPricingSettings, requested string) (string, error) {
	trafficClass := smsapi.NormalizeTrafficClass(requested)
	if trafficClass == "" {
		trafficClass = smsapi.NormalizeTrafficClass(settings.DefaultTrafficClass)
	}
	if !smsapi.IsKnownTrafficClass(trafficClass) {
		return "", fmt.Errorf("%w: %s", ErrSMSPricingNotConfigured, strings.TrimSpace(requested))
	}

	switch trafficClass {
	case smsapi.TrafficClassLocal:
		if !settings.LocalEnabled {
			return "", fmt.Errorf("%w: %s", ErrTrafficClassNotEnabled, trafficClass)
		}
	case smsapi.TrafficClassA2P:
		if !settings.A2PEnabled {
			return "", fmt.Errorf("%w: %s", ErrTrafficClassNotEnabled, trafficClass)
		}
	}
	return trafficClass, nil
}
