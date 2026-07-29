package identity

import (
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestCreateLivenessSessionInputValidation(t *testing.T) {
	t.Parallel()
	input := validCreateSessionInput()
	if err := input.Validate(); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	tests := []struct {
		name   string
		mutate func(*CreateLivenessSessionInput)
	}{
		{"missing attempt", func(value *CreateLivenessSessionInput) { value.AttemptID = uuid.Nil }},
		{"unsupported challenge", func(value *CreateLivenessSessionInput) { value.ChallengeProfile = "passive_v1" }},
		{"unsupported capture", func(value *CreateLivenessSessionInput) { value.CaptureProfile = "ios_v1" }},
		{"excessive lifetime", func(value *CreateLivenessSessionInput) { value.Lifetime = 4 * time.Minute }},
		{"fractional lifetime", func(value *CreateLivenessSessionInput) { value.Lifetime = 1500 * time.Millisecond }},
		{"excessive audit images", func(value *CreateLivenessSessionInput) { value.AuditImageLimit = 5 }},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			candidate := input
			test.mutate(&candidate)
			if !errors.Is(candidate.Validate(), ErrInvalidLivenessContract) {
				t.Fatal("Validate() accepted invalid input")
			}
		})
	}
}

func TestCreateLivenessSessionOutputValidatesBindingAndCapture(t *testing.T) {
	t.Parallel()
	input := validCreateSessionInput()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	output := validCreateSessionOutput(input, now)
	if err := output.Validate(input); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	output.Binding.AttemptID = uuid.New()
	if !errors.Is(output.Validate(input), ErrInvalidLivenessContract) {
		t.Fatal("Validate() accepted a mismatched attempt binding")
	}
}

func TestCreateLivenessSessionOutputRejectsCaptureTokenPastSessionExpiry(t *testing.T) {
	t.Parallel()
	input := validCreateSessionInput()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	output := validCreateSessionOutput(input, now)
	output.Capture.TokenExpiresAt = output.ExpiresAt.Add(time.Second)

	if !errors.Is(output.Validate(input), ErrInvalidLivenessContract) {
		t.Fatal("Validate() accepted a capture token that outlives the session")
	}
}

func TestLivenessSessionSnapshotValidation(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	binding := SessionBinding{
		SessionID:      "session-1",
		VerificationID: uuid.New(),
		AttemptID:      uuid.New(),
	}
	evidence := validEvidence()
	snapshot := LivenessSessionSnapshot{
		ContractVersion: IdentityAIContractVersion,
		Binding:         binding,
		Status:          AttemptStatusSucceeded,
		ExpiresAt:       now.Add(3 * time.Minute),
		UpdatedAt:       now,
		CompletedAt:     &now,
		Result:          &LivenessSessionResult{Evidence: evidence},
	}
	if err := snapshot.Validate(binding); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	snapshot.FailedAt = &now
	if !errors.Is(snapshot.Validate(binding), ErrInvalidLivenessContract) {
		t.Fatal("Validate() accepted conflicting terminal fields")
	}
}

func TestFailedSnapshotRequiresTypedFailure(t *testing.T) {
	t.Parallel()
	now := time.Date(2026, time.July, 29, 12, 0, 0, 0, time.UTC)
	binding := SessionBinding{
		SessionID:      "session-1",
		VerificationID: uuid.New(),
		AttemptID:      uuid.New(),
	}
	snapshot := LivenessSessionSnapshot{
		ContractVersion: IdentityAIContractVersion,
		Binding:         binding,
		Status:          AttemptStatusFailed,
		ExpiresAt:       now.Add(3 * time.Minute),
		UpdatedAt:       now,
		FailedAt:        &now,
		Failure: &LivenessSessionFailure{
			Class:     FailureClassOperational,
			Code:      "model_runtime_unavailable",
			Retryable: true,
		},
	}
	if err := snapshot.Validate(binding); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	snapshot.Failure.Code = ""
	if !errors.Is(snapshot.Validate(binding), ErrInvalidLivenessContract) {
		t.Fatal("Validate() accepted an empty failure code")
	}
}

func validCreateSessionInput() CreateLivenessSessionInput {
	return CreateLivenessSessionInput{
		VerificationID:   uuid.New(),
		AttemptID:        uuid.New(),
		ChallengeProfile: ChallengeProfileMovementV1,
		CaptureProfile:   CaptureProfileWebV1,
		Lifetime:         3 * time.Minute,
		AuditImageLimit:  0,
	}
}

func validCreateSessionOutput(input CreateLivenessSessionInput, now time.Time) CreateLivenessSessionOutput {
	expiresAt := now.Add(input.Lifetime)
	return CreateLivenessSessionOutput{
		ContractVersion: IdentityAIContractVersion,
		Binding: SessionBinding{
			SessionID:      "session-1",
			VerificationID: input.VerificationID,
			AttemptID:      input.AttemptID,
		},
		Status:    AttemptStatusCreated,
		ExpiresAt: expiresAt,
		Capture: CaptureConfiguration{
			Endpoint:       "wss://capture.example.test/v1/liveness/sessions/session-1",
			Token:          "secret-capture-token",
			TokenExpiresAt: expiresAt,
		},
		Challenge: ChallengeDescriptor{Type: "movement", Version: "movement-v1"},
	}
}
