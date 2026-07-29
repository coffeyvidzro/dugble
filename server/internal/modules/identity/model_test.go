package identity

import (
	"errors"
	"math"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestNewVerification(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	input := validVerificationInput(now)

	verification, err := NewVerification(input, now)
	if err != nil {
		t.Fatalf("NewVerification() error = %v", err)
	}
	if verification.Status != VerificationStatusPending {
		t.Fatalf("Status = %q, want %q", verification.Status, VerificationStatusPending)
	}
	if verification.AttemptCount != 0 || verification.AttemptsRemaining() != 3 {
		t.Fatalf("attempt counts = %d/%d, want 0/3", verification.AttemptCount, verification.AttemptsRemaining())
	}

	input.RequiredChecks[0] = CheckType("changed")
	if verification.RequiredChecks[0] != CheckFaceLiveness {
		t.Fatal("NewVerification() did not copy required checks")
	}
}

func TestNewVerificationRejectsInvalidInput(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	tests := []struct {
		name   string
		mutate func(*NewVerificationInput)
	}{
		{"missing team", func(input *NewVerificationInput) { input.TeamID = uuid.Nil }},
		{"unsupported subject", func(input *NewVerificationInput) { input.Subject.Type = "email" }},
		{"empty subject ID", func(input *NewVerificationInput) { input.Subject.ExternalID = " " }},
		{"unsupported purpose", func(input *NewVerificationInput) { input.Purpose = "unknown" }},
		{"empty checks", func(input *NewVerificationInput) { input.RequiredChecks = nil }},
		{"duplicate checks", func(input *NewVerificationInput) {
			input.RequiredChecks = []CheckType{CheckFaceLiveness, CheckFaceLiveness}
		}},
		{"comparison without liveness", func(input *NewVerificationInput) {
			input.RequiredChecks = []CheckType{CheckFaceComparison}
		}},
		{"missing policy", func(input *NewVerificationInput) { input.PolicyVersion = " " }},
		{"no attempts", func(input *NewVerificationInput) { input.MaximumAttempts = 0 }},
		{"expired", func(input *NewVerificationInput) { input.ExpiresAt = now }},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			input := validVerificationInput(now)
			test.mutate(&input)
			_, err := NewVerification(input, now)
			if !errors.Is(err, ErrInvalidVerification) {
				t.Fatalf("NewVerification() error = %v, want ErrInvalidVerification", err)
			}
		})
	}
}

func TestVerificationTerminalFieldsMustAgree(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	verification := mustVerification(t, now)
	outcome := VerificationOutcomeApproved
	verification.Status = VerificationStatusCompleted
	verification.Outcome = &outcome
	verification.CompletedAt = &now
	if err := verification.Validate(); err != nil {
		t.Fatalf("completed verification validation error = %v", err)
	}

	verification.CompletedAt = nil
	if !errors.Is(verification.Validate(), ErrInvalidVerification) {
		t.Fatal("completed verification without completion time was accepted")
	}
}

func TestVerificationCanStartAttempt(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	verification := mustVerification(t, now)
	if err := verification.CanStartAttempt(now); err != nil {
		t.Fatalf("CanStartAttempt() error = %v", err)
	}

	verification.AttemptCount = verification.MaximumAttempts
	if !errors.Is(verification.CanStartAttempt(now), ErrAttemptsExhausted) {
		t.Fatal("CanStartAttempt() did not reject an exhausted verification")
	}

	verification = mustVerification(t, now)
	if !errors.Is(verification.CanStartAttempt(verification.ExpiresAt), ErrInvalidVerification) {
		t.Fatal("CanStartAttempt() did not reject an expired verification")
	}
}

func TestNewLivenessAttempt(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	verification := mustVerification(t, now)
	verification.AttemptCount = 1

	attempt, err := NewLivenessAttempt(uuid.New(), verification, now)
	if err != nil {
		t.Fatalf("NewLivenessAttempt() error = %v", err)
	}
	if attempt.AttemptNumber != 2 {
		t.Fatalf("AttemptNumber = %d, want 2", attempt.AttemptNumber)
	}
	if attempt.Status != AttemptStatusCreated || attempt.Provider != ProviderDugbleIdentityAI {
		t.Fatalf("attempt = %#v", attempt)
	}
}

func TestAttemptTransitions(t *testing.T) {
	t.Parallel()
	tests := []struct {
		from AttemptStatus
		to   AttemptStatus
		want bool
	}{
		{AttemptStatusCreated, AttemptStatusCapturing, true},
		{AttemptStatusCreated, AttemptStatusProcessing, false},
		{AttemptStatusCapturing, AttemptStatusProcessing, true},
		{AttemptStatusCapturing, AttemptStatusFailed, true},
		{AttemptStatusProcessing, AttemptStatusSucceeded, true},
		{AttemptStatusProcessing, AttemptStatusCancelled, false},
		{AttemptStatusSucceeded, AttemptStatusCapturing, false},
		{AttemptStatusFailed, AttemptStatusProcessing, false},
	}
	for _, test := range tests {
		attempt := LivenessAttempt{Status: test.from}
		if got := attempt.CanTransitionTo(test.to); got != test.want {
			t.Errorf("CanTransitionTo(%q) from %q = %v, want %v", test.to, test.from, got, test.want)
		}
	}
}

func TestSuccessfulAttemptRequiresValidEvidence(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	attempt := mustAttempt(t, now)
	attempt.Status = AttemptStatusSucceeded
	attempt.CompletedAt = &now
	evidence := validEvidence()
	attempt.Evidence = &evidence
	if err := attempt.Validate(); err != nil {
		t.Fatalf("successful attempt validation error = %v", err)
	}

	attempt.Evidence.LivenessScore = math.NaN()
	if !errors.Is(attempt.Validate(), ErrInvalidAttempt) {
		t.Fatal("attempt accepted non-finite liveness score")
	}
}

func TestFailedAttemptRequiresClassAndCode(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	attempt := mustAttempt(t, now)
	attempt.Status = AttemptStatusFailed
	attempt.FailedAt = &now
	failureClass := FailureClassOperational
	failureCode := ReasonCode("model_runtime_unavailable")
	attempt.FailureClass = &failureClass
	attempt.FailureCode = &failureCode
	attempt.CountsAgainstLimit = false
	if err := attempt.Validate(); err != nil {
		t.Fatalf("failed attempt validation error = %v", err)
	}

	attempt.FailureCode = nil
	if !errors.Is(attempt.Validate(), ErrInvalidAttempt) {
		t.Fatal("failed attempt without a reason code was accepted")
	}
}

func validVerificationInput(now time.Time) NewVerificationInput {
	return NewVerificationInput{
		ID:     uuid.New(),
		TeamID: uuid.New(),
		Subject: SubjectReference{
			Type:       SubjectTypeCustomerUser,
			ExternalID: "customer-user-123",
		},
		Purpose:         VerificationPurposeOnboarding,
		RequiredChecks:  []CheckType{CheckFaceLiveness, CheckFaceComparison},
		PolicyVersion:   "onboarding-face-v1",
		MaximumAttempts: 3,
		ExpiresAt:       now.Add(15 * time.Minute),
	}
}

func mustVerification(t *testing.T, now time.Time) Verification {
	t.Helper()
	verification, err := NewVerification(validVerificationInput(now), now)
	if err != nil {
		t.Fatalf("NewVerification() error = %v", err)
	}
	return verification
}

func mustAttempt(t *testing.T, now time.Time) LivenessAttempt {
	t.Helper()
	attempt, err := NewLivenessAttempt(uuid.New(), mustVerification(t, now), now)
	if err != nil {
		t.Fatalf("NewLivenessAttempt() error = %v", err)
	}
	return attempt
}

func validEvidence() LivenessEvidenceSummary {
	return LivenessEvidenceSummary{
		LivenessScore:             0.93,
		Sufficiency:               EvidenceSufficient,
		CaptureQualityScore:       0.88,
		CaptureUsable:             true,
		ChallengeCompleted:        true,
		CompletionRatio:           1,
		AttackSuspected:           false,
		ResultContractVersion:     "v1alpha1",
		AnalyzerVersion:           "liveness-v1",
		ChallengeVersion:          "movement-v1",
		FaceDetectorVersion:       "detector-v1",
		LandmarkModelVersion:      "landmarks-v1",
		PresentationAttackVersion: "attack-v1",
	}
}
