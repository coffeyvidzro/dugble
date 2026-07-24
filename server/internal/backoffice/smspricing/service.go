package smspricing

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

var (
	ErrInvalidRequest     = errors.New("invalid sms pricing request")
	ErrPlanNameConflict   = errors.New("sms pricing plan name already exists")
	ErrRateOverlap        = errors.New("sms pricing rate overlaps an existing rate")
	ErrPlanUnavailable    = errors.New("sms pricing plan is not active")
	ErrNoCurrentLocalRate = errors.New("sms pricing plan has no current local rate")
	ErrNoCurrentA2PRate   = errors.New("sms pricing plan has no current a2p rate")
	ErrDefaultPlan        = errors.New("default sms pricing plan cannot be changed this way")
	ErrPlanInUse          = errors.New("sms pricing plan is in use")
	ErrRateImmutable      = errors.New("only scheduled sms pricing rates can be edited or cancelled")
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) List(ctx context.Context) ([]PlanRow, error) {
	return s.repository.List(ctx)
}

func (s *Service) Detail(ctx context.Context, id string) (PlanDetail, error) {
	id = strings.TrimSpace(id)
	detail, err := s.repository.Detail(ctx, id)
	if err != nil {
		return PlanDetail{}, err
	}
	now := time.Now().UTC()
	for _, rate := range detail.Rates {
		rate.Lifecycle = rateLifecycle(rate, now)
		rate.CanEdit = rate.Lifecycle == "scheduled"
		rate.CanCancel = rate.Lifecycle == "scheduled"
		if rate.TrafficClass == smsapi.TrafficClassLocal {
			detail.LocalRates = append(detail.LocalRates, rate)
		} else {
			detail.A2PRates = append(detail.A2PRates, rate)
		}
	}
	detail.Rates = nil
	detail.AssignedTeamCount, detail.RateCount, err = s.repository.PlanUsage(ctx, id)
	if err != nil {
		return PlanDetail{}, err
	}
	detail.CanDelete = !detail.Plan.IsDefault && detail.AssignedTeamCount == 0 && detail.RateCount == 0
	detail.Audits, err = s.repository.PlanAudit(ctx, id)
	if err != nil {
		return PlanDetail{}, err
	}
	return detail, nil
}

func (s *Service) CreatePlan(ctx context.Context, req CreatePlanRequest, actor Actor) (string, error) {
	name, err := validatePlanName(req.Name)
	if err != nil {
		return "", err
	}
	if req.MakeDefault {
		return "", fmt.Errorf("%w: add a current A2P rate before making a plan the default", ErrInvalidRequest)
	}
	id, err := s.repository.CreateManagedPlan(ctx, name, actor)
	if isUniqueViolation(err) {
		return "", ErrPlanNameConflict
	}
	return id, err
}

func (s *Service) RenamePlan(ctx context.Context, id string, req RenamePlanRequest, actor Actor) error {
	name, err := validatePlanName(req.Name)
	if err != nil {
		return err
	}
	err = s.repository.RenamePlan(ctx, strings.TrimSpace(id), name, actor)
	if isUniqueViolation(err) {
		return ErrPlanNameConflict
	}
	return err
}

func (s *Service) SetDefault(ctx context.Context, id string, actor Actor) error {
	id = strings.TrimSpace(id)
	detail, err := s.repository.Detail(ctx, id)
	if err != nil {
		return err
	}
	if detail.Plan.Status != "active" {
		return ErrPlanUnavailable
	}
	if !detail.Plan.HasCurrentA2PRate {
		return ErrNoCurrentA2PRate
	}
	return s.repository.SetManagedDefault(ctx, id, actor)
}

func (s *Service) UpdatePlanStatus(ctx context.Context, id string, action string, actor Actor) error {
	var status string
	switch strings.TrimSpace(action) {
	case "archive":
		status = "archived"
	case "reactivate":
		status = "active"
	default:
		return fmt.Errorf("%w: action must be archive or reactivate", ErrInvalidRequest)
	}
	return s.repository.SetPlanStatus(ctx, strings.TrimSpace(id), status, actor)
}

func (s *Service) DeletePlan(ctx context.Context, id string, actor Actor) error {
	return s.repository.DeleteUnusedPlan(ctx, strings.TrimSpace(id), actor)
}

func (s *Service) PreviewRate(ctx context.Context, planID string, req AddRateRequest) (RatePreview, error) {
	planID = strings.TrimSpace(planID)
	trafficClass, micros, from, until, err := normalizeRateRequest(req.TrafficClass, req.UnitCostUSD, req.EffectiveFrom, req.EffectiveUntil, time.Now().UTC())
	if err != nil {
		return RatePreview{}, err
	}
	detail, err := s.repository.Detail(ctx, planID)
	if err != nil {
		return RatePreview{}, err
	}
	if detail.Plan.Status != "active" {
		return RatePreview{}, ErrPlanUnavailable
	}
	current, hasCurrent, err := s.repository.CurrentRate(ctx, planID, trafficClass)
	if err != nil {
		return RatePreview{}, err
	}
	return RatePreview{
		PlanID:            planID,
		PlanName:          detail.Plan.Name,
		TrafficClass:      trafficClass,
		UnitCostUSD:       formatMicrosInput(micros),
		UnitCostMicros:    micros,
		EffectiveFrom:     from,
		EffectiveUntil:    until,
		CurrentRateMicros: current,
		HasCurrentRate:    hasCurrent,
	}, nil
}

func (s *Service) AddRate(ctx context.Context, planID string, req AddRateRequest, actor Actor) error {
	trafficClass, micros, from, until, err := normalizeRateRequest(req.TrafficClass, req.UnitCostUSD, req.EffectiveFrom, req.EffectiveUntil, time.Now().UTC())
	if err != nil {
		return err
	}
	return s.repository.ScheduleManagedRate(ctx, strings.TrimSpace(planID), trafficClass, micros, from, until, actor)
}

func (s *Service) UpdateRate(ctx context.Context, planID string, rateID string, req UpdateRateRequest, actor Actor) error {
	_, micros, from, until, err := normalizeRateRequest("a2p", req.UnitCostUSD, req.EffectiveFrom, req.EffectiveUntil, time.Time{})
	if err != nil {
		return err
	}
	if !from.After(time.Now().UTC()) {
		return fmt.Errorf("%w: scheduled rate start must remain in the future", ErrInvalidRequest)
	}
	return s.repository.UpdateScheduledRate(ctx, strings.TrimSpace(planID), strings.TrimSpace(rateID), micros, from, until, actor)
}

func (s *Service) CancelRate(ctx context.Context, planID string, rateID string, actor Actor) error {
	return s.repository.CancelScheduledRate(ctx, strings.TrimSpace(planID), strings.TrimSpace(rateID), actor)
}

func (s *Service) ListActivePlans(ctx context.Context) ([]PlanOption, error) {
	return s.repository.ListActivePlans(ctx)
}

func (s *Service) TeamConfiguration(ctx context.Context, teamID string) (TeamConfiguration, error) {
	return s.repository.TeamConfiguration(ctx, strings.TrimSpace(teamID))
}

func (s *Service) UpdateTeam(ctx context.Context, teamID string, req UpdateTeamRequest, actor Actor) error {
	normalized, err := normalizeTeamRequest(req)
	if err != nil {
		return err
	}
	return s.repository.UpdateManagedTeam(ctx, strings.TrimSpace(teamID), normalized, actor)
}

func (s *Service) ResetTeam(ctx context.Context, teamID string, actor Actor) error {
	return s.repository.ResetManagedTeam(ctx, strings.TrimSpace(teamID), actor)
}

func rateLifecycle(rate RateRow, now time.Time) string {
	if rate.Status == "archived" {
		return "archived"
	}
	if rate.EffectiveFrom.After(now) {
		return "scheduled"
	}
	if rate.EffectiveUntil != nil && !rate.EffectiveUntil.After(now) {
		return "expired"
	}
	return "current"
}

func validatePlanName(value string) (string, error) {
	name := strings.TrimSpace(value)
	if utf8.RuneCountInString(name) < 2 || utf8.RuneCountInString(name) > 100 {
		return "", fmt.Errorf("%w: plan name must be between 2 and 100 characters", ErrInvalidRequest)
	}
	return name, nil
}

func normalizeRateRequest(
	trafficClassValue string,
	unitCostValue string,
	effectiveFromValue string,
	effectiveUntilValue string,
	fallback time.Time,
) (string, int64, time.Time, *time.Time, error) {
	trafficClass := smsapi.NormalizeTrafficClass(trafficClassValue)
	if !smsapi.IsKnownTrafficClass(trafficClass) {
		return "", 0, time.Time{}, nil, fmt.Errorf("%w: traffic class must be local or a2p", ErrInvalidRequest)
	}
	unitCostMicros, err := parseUSDToMicros(unitCostValue)
	if err != nil {
		return "", 0, time.Time{}, nil, fmt.Errorf("%w: %v", ErrInvalidRequest, err)
	}
	effectiveFrom, err := parseBackofficeTime(effectiveFromValue, fallback)
	if err != nil {
		return "", 0, time.Time{}, nil, fmt.Errorf("%w: invalid effective-from time", ErrInvalidRequest)
	}
	var effectiveUntil *time.Time
	if strings.TrimSpace(effectiveUntilValue) != "" {
		value, err := parseBackofficeTime(effectiveUntilValue, time.Time{})
		if err != nil {
			return "", 0, time.Time{}, nil, fmt.Errorf("%w: invalid effective-until time", ErrInvalidRequest)
		}
		if !value.After(effectiveFrom) {
			return "", 0, time.Time{}, nil, fmt.Errorf("%w: effective-until must be after effective-from", ErrInvalidRequest)
		}
		effectiveUntil = &value
	}
	return trafficClass, unitCostMicros, effectiveFrom, effectiveUntil, nil
}

func normalizeTeamRequest(req UpdateTeamRequest) (UpdateTeamRequest, error) {
	req.PricingPlanID = strings.TrimSpace(req.PricingPlanID)
	if _, err := uuid.Parse(req.PricingPlanID); err != nil {
		return UpdateTeamRequest{}, fmt.Errorf("%w: a valid pricing plan is required", ErrInvalidRequest)
	}
	req.DefaultTrafficClass = smsapi.NormalizeTrafficClass(req.DefaultTrafficClass)
	if !smsapi.IsKnownTrafficClass(req.DefaultTrafficClass) {
		return UpdateTeamRequest{}, fmt.Errorf("%w: default traffic class must be local or a2p", ErrInvalidRequest)
	}
	if !req.LocalEnabled && !req.A2PEnabled {
		return UpdateTeamRequest{}, fmt.Errorf("%w: at least one traffic class must be enabled", ErrInvalidRequest)
	}
	if req.DefaultTrafficClass == smsapi.TrafficClassLocal && !req.LocalEnabled {
		return UpdateTeamRequest{}, fmt.Errorf("%w: local must be enabled when it is the default", ErrInvalidRequest)
	}
	if req.DefaultTrafficClass == smsapi.TrafficClassA2P && !req.A2PEnabled {
		return UpdateTeamRequest{}, fmt.Errorf("%w: a2p must be enabled when it is the default", ErrInvalidRequest)
	}
	return req, nil
}

func parseUSDToMicros(value string) (int64, error) {
	value = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(value), "$"))
	if value == "" {
		return 0, errors.New("unit cost is required")
	}
	if strings.HasPrefix(value, "-") || strings.HasPrefix(value, "+") {
		return 0, errors.New("unit cost must be positive")
	}
	parts := strings.Split(value, ".")
	if len(parts) > 2 {
		return 0, errors.New("unit cost must be a valid USD amount")
	}
	wholeText := parts[0]
	if wholeText == "" {
		wholeText = "0"
	}
	whole, err := strconv.ParseInt(wholeText, 10, 64)
	if err != nil {
		return 0, errors.New("unit cost must be a valid USD amount")
	}
	fractionText := ""
	if len(parts) == 2 {
		fractionText = parts[1]
	}
	if len(fractionText) > 6 {
		return 0, errors.New("unit cost supports at most six decimal places")
	}
	for len(fractionText) < 6 {
		fractionText += "0"
	}
	fraction := int64(0)
	if fractionText != "" {
		fraction, err = strconv.ParseInt(fractionText, 10, 64)
		if err != nil {
			return 0, errors.New("unit cost must be a valid USD amount")
		}
	}
	maxWhole := int64(math.MaxInt64 / 1_000_000)
	if whole > maxWhole || (whole == maxWhole && fraction > math.MaxInt64-whole*1_000_000) {
		return 0, errors.New("unit cost is too large")
	}
	micros := whole*1_000_000 + fraction
	if micros <= 0 {
		return 0, errors.New("unit cost must be greater than zero")
	}
	return micros, nil
}

func formatMicrosInput(micros int64) string {
	return fmt.Sprintf("%d.%06d", micros/1_000_000, micros%1_000_000)
}

func parseBackofficeTime(value string, fallback time.Time) (time.Time, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		if fallback.IsZero() {
			return time.Time{}, errors.New("time is required")
		}
		return fallback, nil
	}
	for _, layout := range []string{time.RFC3339, "2006-01-02T15:04", "2006-01-02"} {
		parsed, err := time.ParseInLocation(layout, value, time.UTC)
		if err == nil {
			return parsed.UTC(), nil
		}
	}
	return time.Time{}, errors.New("invalid time")
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
