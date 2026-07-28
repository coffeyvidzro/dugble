package identity

import (
	"context"
	"errors"
	"math"
	"strings"

	identityintegration "github.com/coffeyvidzro/dugble/server/internal/integration/identity"
)

type Analyzer interface {
	Ready(context.Context) (identityintegration.Readiness, error)
	CheckLiveness(context.Context, identityintegration.LivenessRequest) (identityintegration.LivenessEvidence, error)
	CompareFaces(context.Context, identityintegration.FaceComparisonRequest) (identityintegration.FaceComparisonEvidence, error)
}

type ServiceConfig struct {
	PolicyVersion           string
	AttackThreshold         float64
	FaceSimilarityThreshold float64
}

type Service struct {
	analyzer Analyzer
	config   ServiceConfig
}

func NewService(analyzer Analyzer, config ServiceConfig) (*Service, error) {
	config.PolicyVersion = strings.TrimSpace(config.PolicyVersion)
	if analyzer == nil {
		return nil, errors.New("identity analyzer is required")
	}
	if config.PolicyVersion == "" {
		return nil, errors.New("identity policy version is required")
	}
	if !withinExclusiveUnit(config.AttackThreshold) || !withinExclusiveUnit(config.FaceSimilarityThreshold) {
		return nil, errors.New("identity policy thresholds must be within 0..1")
	}
	return &Service{analyzer: analyzer, config: config}, nil
}

func (s *Service) Ready(ctx context.Context) (identityintegration.Readiness, error) {
	return s.analyzer.Ready(ctx)
}

func (s *Service) AnalyzeLiveness(ctx context.Context, request identityintegration.LivenessRequest) (LivenessResult, error) {
	request.AttackThreshold = s.config.AttackThreshold
	evidence, err := s.analyzer.CheckLiveness(ctx, request)
	if err != nil {
		return LivenessResult{}, err
	}
	if math.Abs(evidence.AttackThreshold-s.config.AttackThreshold) > 1e-9 {
		return LivenessResult{}, errors.New("identity analyzer used an unexpected attack threshold")
	}
	result := LivenessResult{
		Outcome:         OutcomeApproved,
		ChallengeMet:    evidence.Challenge.ChallengeCompleted,
		AttackSuspected: evidence.AttackSuspected,
		Reasons:         append([]string(nil), evidence.Reasons...),
		PolicyVersion:   s.config.PolicyVersion,
	}
	for _, signal := range evidence.PresentationAttack.Signals {
		if signal.Score > result.AttackScore {
			result.AttackScore = signal.Score
		}
	}
	if !result.ChallengeMet {
		result.Outcome = OutcomeRetry
	}
	if result.AttackSuspected {
		result.Outcome = OutcomeManualReview
	}
	return result, nil
}

func (s *Service) CompareFaces(ctx context.Context, request identityintegration.FaceComparisonRequest) (FaceComparisonResult, error) {
	evidence, err := s.analyzer.CompareFaces(ctx, request)
	if err != nil {
		return FaceComparisonResult{}, err
	}
	return FaceComparisonResult{
		Matched:       evidence.Similarity >= s.config.FaceSimilarityThreshold,
		Similarity:    evidence.Similarity,
		PolicyVersion: s.config.PolicyVersion,
	}, nil
}

func withinExclusiveUnit(value float64) bool {
	return !math.IsNaN(value) && !math.IsInf(value, 0) && value > 0 && value < 1
}
