package identity

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type SubjectType string

const (
	SubjectTypeDugbleUser   SubjectType = "dugble_user"
	SubjectTypeCustomerUser SubjectType = "customer_user"
	SubjectTypeAnonymous    SubjectType = "anonymous"
)

type VerificationPurpose string

const (
	VerificationPurposeOnboarding      VerificationPurpose = "onboarding"
	VerificationPurposeAccountRecovery VerificationPurpose = "account_recovery"
	VerificationPurposeStepUp          VerificationPurpose = "step_up"
	VerificationPurposeAgeAssurance    VerificationPurpose = "age_assurance"
	VerificationPurposeHumanPresence   VerificationPurpose = "human_presence"
)

type CheckType string

const (
	CheckFaceLiveness   CheckType = "face_liveness"
	CheckFaceComparison CheckType = "face_comparison"
)

type VerificationStatus string

const (
	VerificationStatusPending    VerificationStatus = "pending"
	VerificationStatusInProgress VerificationStatus = "in_progress"
	VerificationStatusCompleted  VerificationStatus = "completed"
	VerificationStatusExpired    VerificationStatus = "expired"
	VerificationStatusCancelled  VerificationStatus = "cancelled"
)

type VerificationOutcome string

const (
	VerificationOutcomeApproved            VerificationOutcome = "approved"
	VerificationOutcomeRejected            VerificationOutcome = "rejected"
	VerificationOutcomeReviewRequired      VerificationOutcome = "review_required"
	VerificationOutcomeAlternativeRequired VerificationOutcome = "alternative_required"
)

type NextAction string

const (
	NextActionCapture     NextAction = "capture"
	NextActionWait        NextAction = "wait"
	NextActionRetry       NextAction = "retry"
	NextActionReview      NextAction = "review"
	NextActionAlternative NextAction = "alternative_verification"
	NextActionComplete    NextAction = "complete"
)

type AttemptStatus string

const (
	AttemptStatusCreated    AttemptStatus = "created"
	AttemptStatusCapturing  AttemptStatus = "capturing"
	AttemptStatusProcessing AttemptStatus = "processing"
	AttemptStatusSucceeded  AttemptStatus = "succeeded"
	AttemptStatusFailed     AttemptStatus = "failed"
	AttemptStatusExpired    AttemptStatus = "expired"
	AttemptStatusCancelled  AttemptStatus = "cancelled"
)

type EvidenceSufficiency string

const (
	EvidenceSufficient    EvidenceSufficiency = "sufficient"
	EvidenceInsufficient  EvidenceSufficiency = "insufficient"
	EvidenceIndeterminate EvidenceSufficiency = "indeterminate"
)

type FailureClass string

const (
	FailureClassCapture     FailureClass = "capture"
	FailureClassEvidence    FailureClass = "evidence"
	FailureClassSecurity    FailureClass = "security"
	FailureClassOperational FailureClass = "operational"
)

type ReasonCode string

const ProviderDugbleIdentityAI = "dugble_identity_ai"

var (
	ErrInvalidVerification = errors.New("invalid identity verification")
	ErrInvalidAttempt      = errors.New("invalid liveness attempt")
	ErrAttemptsExhausted   = errors.New("identity verification attempts exhausted")
)

type SubjectReference struct {
	Type       SubjectType
	ExternalID string
}

type Verification struct {
	ID              uuid.UUID
	TeamID          uuid.UUID
	Subject         SubjectReference
	Purpose         VerificationPurpose
	RequiredChecks  []CheckType
	Status          VerificationStatus
	Outcome         *VerificationOutcome
	OutcomeReasons  []ReasonCode
	PolicyVersion   string
	AttemptCount    int
	MaximumAttempts int
	ExpiresAt       time.Time
	CompletedAt     *time.Time
	CancelledAt     *time.Time
	CreatedBy       *uuid.UUID
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type NewVerificationInput struct {
	ID              uuid.UUID
	TeamID          uuid.UUID
	Subject         SubjectReference
	Purpose         VerificationPurpose
	RequiredChecks  []CheckType
	PolicyVersion   string
	MaximumAttempts int
	ExpiresAt       time.Time
	CreatedBy       *uuid.UUID
}

type LivenessEvidenceSummary struct {
	LivenessScore             float64
	Sufficiency               EvidenceSufficiency
	CaptureQualityScore       float64
	CaptureUsable             bool
	ChallengeCompleted        bool
	CompletionRatio           float64
	AttackSuspected           bool
	ReferenceImageKey         *string
	Reasons                   []ReasonCode
	ResultContractVersion     string
	AnalyzerVersion           string
	ChallengeVersion          string
	FaceDetectorVersion       string
	LandmarkModelVersion      string
	PresentationAttackVersion string
}

type LivenessAttempt struct {
	ID                 uuid.UUID
	VerificationID     uuid.UUID
	AttemptNumber      int
	Status             AttemptStatus
	Provider           string
	ProviderSessionID  *string
	ChallengeType      string
	ChallengeVersion   string
	CaptureProfile     string
	SessionExpiresAt   *time.Time
	StartedAt          *time.Time
	ProcessingAt       *time.Time
	CompletedAt        *time.Time
	FailedAt           *time.Time
	ExpiredAt          *time.Time
	CancelledAt        *time.Time
	Evidence           *LivenessEvidenceSummary
	FailureClass       *FailureClass
	FailureCode        *ReasonCode
	CountsAgainstLimit bool
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

const IdentityAIContractVersion = "v1alpha1"

var ErrInvalidLivenessContract = errors.New("invalid liveness client contract")

type ChallengeProfile string

const ChallengeProfileMovementV1 ChallengeProfile = "movement_v1"

type CaptureProfile string

const CaptureProfileWebV1 CaptureProfile = "web_v1"

type CreateLivenessSessionInput struct {
	VerificationID   uuid.UUID
	AttemptID        uuid.UUID
	ChallengeProfile ChallengeProfile
	CaptureProfile   CaptureProfile
	Lifetime         time.Duration
	AuditImageLimit  int
}

type SessionBinding struct {
	SessionID      string
	VerificationID uuid.UUID
	AttemptID      uuid.UUID
}

type CaptureConfiguration struct {
	Endpoint       string
	Token          string
	TokenExpiresAt time.Time
}

type ChallengeDescriptor struct {
	Type    string
	Version string
}

type CreateLivenessSessionOutput struct {
	ContractVersion string
	Binding         SessionBinding
	Status          AttemptStatus
	ExpiresAt       time.Time
	Capture         CaptureConfiguration
	Challenge       ChallengeDescriptor
}

type LivenessSessionFailure struct {
	Class     FailureClass
	Code      ReasonCode
	Retryable bool
}

type LivenessSessionResult struct {
	Evidence LivenessEvidenceSummary
}

type LivenessSessionSnapshot struct {
	ContractVersion string
	Binding         SessionBinding
	Status          AttemptStatus
	ExpiresAt       time.Time
	UpdatedAt       time.Time
	CompletedAt     *time.Time
	FailedAt        *time.Time
	ExpiredAt       *time.Time
	CancelledAt     *time.Time
	Result          *LivenessSessionResult
	Failure         *LivenessSessionFailure
}
