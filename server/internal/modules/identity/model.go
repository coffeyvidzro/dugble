package identity

import (
	"errors"
	"fmt"
	"math"
	"strings"
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

func NewVerification(input NewVerificationInput, now time.Time) (Verification, error) {
	verification := Verification{
		ID:              input.ID,
		TeamID:          input.TeamID,
		Subject:         input.Subject,
		Purpose:         input.Purpose,
		RequiredChecks:  append([]CheckType(nil), input.RequiredChecks...),
		Status:          VerificationStatusPending,
		PolicyVersion:   strings.TrimSpace(input.PolicyVersion),
		MaximumAttempts: input.MaximumAttempts,
		ExpiresAt:       input.ExpiresAt.UTC(),
		CreatedBy:       input.CreatedBy,
		CreatedAt:       now.UTC(),
		UpdatedAt:       now.UTC(),
	}
	if err := verification.Validate(); err != nil {
		return Verification{}, err
	}
	return verification, nil
}

func (v Verification) Validate() error {
	if v.ID == uuid.Nil {
		return invalidVerification("ID is required")
	}
	if v.TeamID == uuid.Nil {
		return invalidVerification("team ID is required")
	}
	if !validSubjectType(v.Subject.Type) || strings.TrimSpace(v.Subject.ExternalID) == "" {
		return invalidVerification("a supported subject type and opaque external ID are required")
	}
	if !validPurpose(v.Purpose) {
		return invalidVerification("purpose is unsupported")
	}
	if err := validateChecks(v.RequiredChecks); err != nil {
		return err
	}
	if !validVerificationStatus(v.Status) {
		return invalidVerification("status is unsupported")
	}
	if strings.TrimSpace(v.PolicyVersion) == "" {
		return invalidVerification("policy version is required")
	}
	if v.MaximumAttempts <= 0 {
		return invalidVerification("maximum attempts must be positive")
	}
	if v.AttemptCount < 0 || v.AttemptCount > v.MaximumAttempts {
		return invalidVerification("attempt count must be within the configured limit")
	}
	if v.CreatedAt.IsZero() || !v.ExpiresAt.After(v.CreatedAt) {
		return invalidVerification("expiry must follow creation")
	}
	if v.UpdatedAt.Before(v.CreatedAt) {
		return invalidVerification("update time cannot precede creation")
	}

	switch v.Status {
	case VerificationStatusCompleted:
		if v.Outcome == nil || !validOutcome(*v.Outcome) || v.CompletedAt == nil {
			return invalidVerification("completed verification requires an outcome and completion time")
		}
		if v.CancelledAt != nil {
			return invalidVerification("completed verification cannot be cancelled")
		}
	case VerificationStatusCancelled:
		if v.CancelledAt == nil || v.Outcome != nil || v.CompletedAt != nil {
			return invalidVerification("cancelled verification has inconsistent terminal fields")
		}
	default:
		if v.Outcome != nil || v.CompletedAt != nil || v.CancelledAt != nil {
			return invalidVerification("active or expired verification has terminal fields")
		}
	}
	return nil
}

func (v Verification) IsTerminal() bool {
	return v.Status == VerificationStatusCompleted ||
		v.Status == VerificationStatusExpired ||
		v.Status == VerificationStatusCancelled
}

func (v Verification) AttemptsRemaining() int {
	remaining := v.MaximumAttempts - v.AttemptCount
	if remaining < 0 {
		return 0
	}
	return remaining
}

func (v Verification) CanStartAttempt(now time.Time) error {
	if err := v.Validate(); err != nil {
		return err
	}
	if v.IsTerminal() {
		return fmt.Errorf("%w: verification is terminal", ErrInvalidVerification)
	}
	if !now.Before(v.ExpiresAt) {
		return fmt.Errorf("%w: verification has expired", ErrInvalidVerification)
	}
	if v.AttemptsRemaining() == 0 {
		return ErrAttemptsExhausted
	}
	return nil
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

func (e LivenessEvidenceSummary) Validate() error {
	for name, value := range map[string]float64{
		"liveness score":        e.LivenessScore,
		"capture quality score": e.CaptureQualityScore,
		"completion ratio":      e.CompletionRatio,
	} {
		if math.IsNaN(value) || math.IsInf(value, 0) || value < 0 || value > 1 {
			return fmt.Errorf("%w: %s must be finite and within 0..1", ErrInvalidAttempt, name)
		}
	}
	if !validSufficiency(e.Sufficiency) {
		return fmt.Errorf("%w: evidence sufficiency is unsupported", ErrInvalidAttempt)
	}
	for name, value := range map[string]string{
		"result contract version":     e.ResultContractVersion,
		"analyzer version":            e.AnalyzerVersion,
		"challenge version":           e.ChallengeVersion,
		"face detector version":       e.FaceDetectorVersion,
		"landmark model version":      e.LandmarkModelVersion,
		"presentation attack version": e.PresentationAttackVersion,
	} {
		if strings.TrimSpace(value) == "" {
			return fmt.Errorf("%w: %s is required", ErrInvalidAttempt, name)
		}
	}
	if e.ReferenceImageKey != nil && strings.TrimSpace(*e.ReferenceImageKey) == "" {
		return fmt.Errorf("%w: reference image key cannot be blank", ErrInvalidAttempt)
	}
	return nil
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

func NewLivenessAttempt(
	id uuid.UUID,
	verification Verification,
	now time.Time,
) (LivenessAttempt, error) {
	if err := verification.CanStartAttempt(now); err != nil {
		return LivenessAttempt{}, err
	}
	attempt := LivenessAttempt{
		ID:             id,
		VerificationID: verification.ID,
		AttemptNumber:  verification.AttemptCount + 1,
		Status:         AttemptStatusCreated,
		Provider:       ProviderDugbleIdentityAI,
		CreatedAt:      now.UTC(),
		UpdatedAt:      now.UTC(),
	}
	if err := attempt.Validate(); err != nil {
		return LivenessAttempt{}, err
	}
	return attempt, nil
}

func (a LivenessAttempt) Validate() error {
	if a.ID == uuid.Nil || a.VerificationID == uuid.Nil {
		return invalidAttempt("attempt and verification IDs are required")
	}
	if a.AttemptNumber <= 0 {
		return invalidAttempt("attempt number must be positive")
	}
	if !validAttemptStatus(a.Status) {
		return invalidAttempt("status is unsupported")
	}
	if strings.TrimSpace(a.Provider) == "" {
		return invalidAttempt("provider is required")
	}
	if a.CreatedAt.IsZero() || a.UpdatedAt.Before(a.CreatedAt) {
		return invalidAttempt("attempt timestamps are inconsistent")
	}
	if a.ProviderSessionID != nil && strings.TrimSpace(*a.ProviderSessionID) == "" {
		return invalidAttempt("provider session ID cannot be blank")
	}
	if a.SessionExpiresAt != nil && !a.SessionExpiresAt.After(a.CreatedAt) {
		return invalidAttempt("session expiry must follow creation")
	}

	switch a.Status {
	case AttemptStatusSucceeded:
		if a.Evidence == nil || a.CompletedAt == nil {
			return invalidAttempt("successful attempt requires evidence and completion time")
		}
		if err := a.Evidence.Validate(); err != nil {
			return err
		}
		if a.FailureClass != nil || a.FailureCode != nil || a.FailedAt != nil ||
			a.ExpiredAt != nil || a.CancelledAt != nil {
			return invalidAttempt("successful attempt cannot contain failure fields")
		}
	case AttemptStatusFailed:
		if a.FailureClass == nil || !validFailureClass(*a.FailureClass) ||
			a.FailureCode == nil || strings.TrimSpace(string(*a.FailureCode)) == "" ||
			a.FailedAt == nil {
			return invalidAttempt("failed attempt requires a failure class, code, and time")
		}
		if a.Evidence != nil || a.CompletedAt != nil || a.ExpiredAt != nil ||
			a.CancelledAt != nil {
			return invalidAttempt("failed attempt cannot contain successful evidence")
		}
	case AttemptStatusCancelled:
		if a.CancelledAt == nil || a.Evidence != nil || a.FailureClass != nil ||
			a.FailureCode != nil || a.CompletedAt != nil || a.FailedAt != nil ||
			a.ExpiredAt != nil {
			return invalidAttempt("cancelled attempt has inconsistent terminal fields")
		}
	case AttemptStatusExpired:
		if a.ExpiredAt == nil || a.Evidence != nil || a.FailureClass != nil ||
			a.FailureCode != nil || a.CompletedAt != nil || a.FailedAt != nil ||
			a.CancelledAt != nil {
			return invalidAttempt("expired attempt has inconsistent terminal fields")
		}
	default:
		if a.Evidence != nil || a.FailureClass != nil || a.FailureCode != nil ||
			a.CompletedAt != nil || a.FailedAt != nil || a.ExpiredAt != nil ||
			a.CancelledAt != nil {
			return invalidAttempt("active attempt has terminal fields")
		}
	}
	return nil
}

func (a LivenessAttempt) IsTerminal() bool {
	return a.Status == AttemptStatusSucceeded ||
		a.Status == AttemptStatusFailed ||
		a.Status == AttemptStatusExpired ||
		a.Status == AttemptStatusCancelled
}

func (a LivenessAttempt) CanTransitionTo(next AttemptStatus) bool {
	allowed := map[AttemptStatus]map[AttemptStatus]bool{
		AttemptStatusCreated: {
			AttemptStatusCapturing: true,
			AttemptStatusCancelled: true,
			AttemptStatusExpired:   true,
		},
		AttemptStatusCapturing: {
			AttemptStatusProcessing: true,
			AttemptStatusFailed:     true,
			AttemptStatusCancelled:  true,
			AttemptStatusExpired:    true,
		},
		AttemptStatusProcessing: {
			AttemptStatusSucceeded: true,
			AttemptStatusFailed:    true,
		},
	}
	return allowed[a.Status][next]
}

func invalidVerification(message string) error {
	return fmt.Errorf("%w: %s", ErrInvalidVerification, message)
}

func invalidAttempt(message string) error {
	return fmt.Errorf("%w: %s", ErrInvalidAttempt, message)
}

func validateChecks(checks []CheckType) error {
	if len(checks) == 0 {
		return invalidVerification("at least one check is required")
	}
	seen := make(map[CheckType]struct{}, len(checks))
	for _, check := range checks {
		if check != CheckFaceLiveness && check != CheckFaceComparison {
			return invalidVerification("required check is unsupported")
		}
		if _, exists := seen[check]; exists {
			return invalidVerification("required checks must be unique")
		}
		seen[check] = struct{}{}
	}
	if _, comparison := seen[CheckFaceComparison]; comparison {
		if _, liveness := seen[CheckFaceLiveness]; !liveness {
			return invalidVerification("face comparison requires face liveness")
		}
	}
	return nil
}

func validSubjectType(value SubjectType) bool {
	return value == SubjectTypeDugbleUser ||
		value == SubjectTypeCustomerUser ||
		value == SubjectTypeAnonymous
}

func validPurpose(value VerificationPurpose) bool {
	return value == VerificationPurposeOnboarding ||
		value == VerificationPurposeAccountRecovery ||
		value == VerificationPurposeStepUp ||
		value == VerificationPurposeAgeAssurance ||
		value == VerificationPurposeHumanPresence
}

func validVerificationStatus(value VerificationStatus) bool {
	return value == VerificationStatusPending ||
		value == VerificationStatusInProgress ||
		value == VerificationStatusCompleted ||
		value == VerificationStatusExpired ||
		value == VerificationStatusCancelled
}

func validOutcome(value VerificationOutcome) bool {
	return value == VerificationOutcomeApproved ||
		value == VerificationOutcomeRejected ||
		value == VerificationOutcomeReviewRequired ||
		value == VerificationOutcomeAlternativeRequired
}

func validAttemptStatus(value AttemptStatus) bool {
	return value == AttemptStatusCreated ||
		value == AttemptStatusCapturing ||
		value == AttemptStatusProcessing ||
		value == AttemptStatusSucceeded ||
		value == AttemptStatusFailed ||
		value == AttemptStatusExpired ||
		value == AttemptStatusCancelled
}

func validSufficiency(value EvidenceSufficiency) bool {
	return value == EvidenceSufficient ||
		value == EvidenceInsufficient ||
		value == EvidenceIndeterminate
}

func validFailureClass(value FailureClass) bool {
	return value == FailureClassCapture ||
		value == FailureClassEvidence ||
		value == FailureClassSecurity ||
		value == FailureClassOperational
}
