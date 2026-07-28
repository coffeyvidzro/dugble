package identity

import (
	"time"

	"github.com/google/uuid"
)

type Purpose string
type Check string
type Status string
type Outcome string

const (
	PurposeOnboarding           Purpose = "onboarding"
	PurposeStepUpAuthentication Purpose = "step_up_authentication"
	PurposeAccountRecovery      Purpose = "account_recovery"
	PurposeTransaction          Purpose = "transaction"
	PurposeBotDeterrence        Purpose = "bot_deterrence"
)

const (
	CheckFaceLiveness       Check = "face_liveness"
	CheckFaceComparison     Check = "face_comparison"
	CheckPresentationAttack Check = "presentation_attack"
	CheckBiometricQuality   Check = "biometric_quality"
)

const (
	StatusRequiresCapture Status = "requires_capture"
	StatusSubmitted       Status = "submitted"
	StatusProcessing      Status = "processing"
	StatusCompleted       Status = "completed"
	StatusRetryRequired   Status = "retry_required"
	StatusManualReview    Status = "manual_review"
	StatusFailed          Status = "failed"
	StatusCancelled       Status = "cancelled"
	StatusExpired         Status = "expired"
)

const (
	OutcomeApproved     Outcome = "approved"
	OutcomeRetry        Outcome = "retry"
	OutcomeManualReview Outcome = "manual_review"
	OutcomeDeclined     Outcome = "declined"
)

type Verification struct {
	ID                uuid.UUID  `json:"id"`
	TeamID            uuid.UUID  `json:"-"`
	ExternalReference string     `json:"external_reference,omitempty"`
	SubjectReference  string     `json:"subject_reference"`
	Purpose           Purpose    `json:"purpose"`
	Checks            []Check    `json:"checks"`
	Status            Status     `json:"status"`
	Outcome           *Outcome   `json:"outcome,omitempty"`
	PolicyVersion     string     `json:"policy_version"`
	AttemptCount      int32      `json:"attempt_count"`
	MaxAttempts       int32      `json:"max_attempts"`
	ExpiresAt         time.Time  `json:"expires_at"`
	CompletedAt       *time.Time `json:"completed_at,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

type CreateVerificationRequest struct {
	ExternalReference string  `json:"external_reference"`
	SubjectReference  string  `json:"subject_reference"`
	Purpose           Purpose `json:"purpose"`
	Checks            []Check `json:"checks"`
	ReferenceID       *string `json:"reference_id,omitempty"`
}

type LivenessResult struct {
	Outcome         Outcome  `json:"outcome"`
	ChallengeMet    bool     `json:"challenge_met"`
	AttackSuspected bool     `json:"attack_suspected"`
	AttackScore     float64  `json:"attack_score"`
	Reasons         []string `json:"reasons"`
	PolicyVersion   string   `json:"policy_version"`
}

type FaceComparisonResult struct {
	Matched       bool    `json:"matched"`
	Similarity    float64 `json:"similarity"`
	PolicyVersion string  `json:"policy_version"`
}
