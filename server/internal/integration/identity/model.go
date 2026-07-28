package identity

import (
	"context"
	"errors"
	"math"
	"strings"
)

type Analyzer interface {
	Ready(context.Context) (Readiness, error)
	CheckLiveness(context.Context, LivenessRequest) (LivenessEvidence, error)
	CompareFaces(context.Context, FaceComparisonRequest) (FaceComparisonEvidence, error)
}

type Readiness struct {
	Status                   string `json:"status"`
	Enabled                  bool   `json:"enabled"`
	AuthenticationConfigured bool   `json:"authentication_configured"`
	ModelsReady              bool   `json:"models_ready"`
	ModelStatus              string `json:"model_status"`
}

type LivenessRequest struct {
	VerificationID  string  `json:"verification_id"`
	SessionID       string  `json:"session_id"`
	VideoObjectKey  string  `json:"video_object_key"`
	AttackThreshold float64 `json:"attack_threshold"`
}

type FaceComparisonRequest struct {
	VerificationID   string `json:"verification_id"`
	ReferenceFaceKey string `json:"reference_face_key"`
	ProbeFaceKey     string `json:"probe_face_key"`
}

type ChallengeEvidence struct {
	ChallengeID          string   `json:"challenge_id"`
	ChallengeCompleted   bool     `json:"challenge_completed"`
	CompletionRatio      float64  `json:"completion_ratio"`
	Reasons              []string `json:"reasons"`
	LandmarkModelVersion string   `json:"landmark_model_version"`
}

type PresentationAttackSignal struct {
	AttackType string  `json:"attack_type"`
	Score      float64 `json:"score"`
}

type PresentationAttackEvidence struct {
	Signals      []PresentationAttackSignal `json:"signals"`
	ModelVersion string                     `json:"model_version"`
}

type LivenessEvidence struct {
	Challenge          ChallengeEvidence          `json:"challenge"`
	PresentationAttack PresentationAttackEvidence `json:"presentation_attack"`
	AttackThreshold    float64                    `json:"attack_threshold"`
	AttackSuspected    bool                       `json:"attack_suspected"`
	Reasons            []string                   `json:"reasons"`
}

type FaceComparisonEvidence struct {
	Similarity            float64 `json:"similarity"`
	DetectorVersion       string  `json:"detector_version"`
	EmbeddingModelVersion string  `json:"embedding_model_version"`
}

func validateLivenessEvidence(evidence LivenessEvidence) error {
	if strings.TrimSpace(evidence.Challenge.ChallengeID) == "" {
		return errors.New("identity AI liveness evidence is missing challenge ID")
	}
	if !finiteWithin(evidence.Challenge.CompletionRatio, 0, 1) {
		return errors.New("identity AI challenge completion ratio is invalid")
	}
	if evidence.Challenge.ChallengeCompleted != (evidence.Challenge.CompletionRatio == 1) {
		return errors.New("identity AI challenge completion disagrees with its ratio")
	}
	if !finiteWithin(evidence.AttackThreshold, 0, 1) || evidence.AttackThreshold == 0 || evidence.AttackThreshold == 1 {
		return errors.New("identity AI attack threshold is invalid")
	}
	if strings.TrimSpace(evidence.PresentationAttack.ModelVersion) == "" || len(evidence.PresentationAttack.Signals) == 0 {
		return errors.New("identity AI presentation-attack evidence is incomplete")
	}
	suspected := false
	seen := make(map[string]struct{}, len(evidence.PresentationAttack.Signals))
	for _, signal := range evidence.PresentationAttack.Signals {
		attackType := strings.TrimSpace(signal.AttackType)
		if attackType == "" || !finiteWithin(signal.Score, 0, 1) {
			return errors.New("identity AI presentation-attack signal is invalid")
		}
		if _, exists := seen[attackType]; exists {
			return errors.New("identity AI presentation-attack signals contain duplicates")
		}
		seen[attackType] = struct{}{}
		suspected = suspected || signal.Score >= evidence.AttackThreshold
	}
	if suspected != evidence.AttackSuspected {
		return errors.New("identity AI attack assessment disagrees with its signals")
	}
	return nil
}

func validateFaceComparisonEvidence(evidence FaceComparisonEvidence) error {
	if !finiteWithin(evidence.Similarity, -1, 1) {
		return errors.New("identity AI face similarity is invalid")
	}
	if strings.TrimSpace(evidence.DetectorVersion) == "" || strings.TrimSpace(evidence.EmbeddingModelVersion) == "" {
		return errors.New("identity AI face comparison is missing model versions")
	}
	return nil
}

func validateLivenessRequest(request LivenessRequest) error {
	if strings.TrimSpace(request.VerificationID) == "" || strings.TrimSpace(request.SessionID) == "" {
		return errors.New("identity AI liveness request requires verification and session IDs")
	}
	if err := validateObjectKey(request.VideoObjectKey); err != nil {
		return err
	}
	if !finiteWithin(request.AttackThreshold, 0, 1) || request.AttackThreshold == 0 || request.AttackThreshold == 1 {
		return errors.New("identity AI liveness request attack threshold is invalid")
	}
	return nil
}

func validateFaceComparisonRequest(request FaceComparisonRequest) error {
	if strings.TrimSpace(request.VerificationID) == "" {
		return errors.New("identity AI face comparison requires a verification ID")
	}
	if err := validateObjectKey(request.ReferenceFaceKey); err != nil {
		return err
	}
	return validateObjectKey(request.ProbeFaceKey)
}

func validateObjectKey(value string) error {
	value = strings.TrimSpace(value)
	if value == "" || strings.HasPrefix(value, "/") || strings.Contains(value, "://") {
		return errors.New("identity AI media object key is invalid")
	}
	for _, part := range strings.Split(value, "/") {
		if part == "" || part == "." || part == ".." {
			return errors.New("identity AI media object key is invalid")
		}
	}
	return nil
}

func finiteWithin(value, minimum, maximum float64) bool {
	return !math.IsNaN(value) && !math.IsInf(value, 0) && value >= minimum && value <= maximum
}
