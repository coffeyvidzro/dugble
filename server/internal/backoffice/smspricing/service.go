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
	return s.repository.Detail(ctx, strings.TrimSpace(id))
}

func (s *Service) CreatePlan(ctx context.Context, req CreatePlanRequest) (string, error) {
	name := strings.TrimSpace(req.Name)
	if utf8.RuneCountInString(name) < 2 || utf8.RuneCountInString(name) > 100 {
		return "", fmt.Errorf("%w: plan name must be between 2 and 100 characters", ErrInvalidRequest)
	}
	if req.MakeDefault {
		return "", fmt.Errorf("%w: add a current A2P rate before making a plan the default", ErrInvalidRequest)
	}

	id, err := s.repository.CreatePlan(ctx, name, false)
	if isUniqueViolation(err) {
		return "", ErrPlanNameConflict
	}
	return id, err
}

func (s *Service) SetDefault(ctx context.Context, id string) error {
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
	return s.repository.SetDefault(ctx, id)
}

func (s *Service) AddRate(ctx context.Context, planID string, req AddRateRequest) error {
	planID = strings.TrimSpace(planID)
	trafficClass := smsapi.NormalizeTrafficClass(req.TrafficClass)
	if !smsapi.IsKnownTrafficClass(trafficClass) {
		return fmt.Errorf("%w: traffic class must be local or a2p", ErrInvalidRequest)
	}

	unitCostMicros, err := parseUSDToMicros(req.UnitCostUSD)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrInvalidRequest, err)
	}

	effectiveFrom, err := parseBackofficeTime(req.EffectiveFrom, time.Now().UTC())
	if err != nil {
		return fmt.Errorf("%w: invalid effective-from time", ErrInvalidRequest)
	}
	var effectiveUntil *time.Time
	if strings.TrimSpace(req.EffectiveUntil) != "" {
		value, err := parseBackofficeTime(req.EffectiveUntil, time.Time{})
		if err != nil {
			return fmt.Errorf("%w: invalid effective-until time", ErrInvalidRequest)
		}
		if !value.After(effectiveFrom) {
			return fmt.Errorf("%w: effective-until must be after effective-from", ErrInvalidRequest)
		}
		effectiveUntil = &value
	}

	return s.repository.AddRate(ctx, planID, trafficClass, unitCostMicros, effectiveFrom, effectiveUntil)
}

func (s *Service) ListActivePlans(ctx context.Context) ([]PlanOption, error) {
	return s.repository.ListActivePlans(ctx)
}

func (s *Service) TeamConfiguration(ctx context.Context, teamID string) (TeamConfiguration, error) {
	return s.repository.TeamConfiguration(ctx, strings.TrimSpace(teamID))
}

func (s *Service) UpdateTeam(ctx context.Context, teamID string, req UpdateTeamRequest) error {
	normalized, err := normalizeTeamRequest(req)
	if err != nil {
		return err
	}
	return s.repository.UpdateTeam(ctx, strings.TrimSpace(teamID), normalized)
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
	if whole > math.MaxInt64/1_000_000 {
		return 0, errors.New("unit cost is too large")
	}
	micros := whole*1_000_000 + fraction
	if micros <= 0 {
		return 0, errors.New("unit cost must be greater than zero")
	}
	return micros, nil
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
