package identity

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
)

const IdentityAIContractVersion = "v1alpha1"

var ErrInvalidLivenessContract = errors.New("invalid liveness client contract")

type ChallengeProfile string

const ChallengeProfileMovementV1 ChallengeProfile = "movement_v1"

type CaptureProfile string

const CaptureProfileWebV1 CaptureProfile = "web_v1"

// LivenessClient is the private control-plane boundary consumed by the identity service.
// Implementations translate these semantic types to the Identity AI transport contract.
type LivenessClient interface {
	CreateSession(context.Context, CreateLivenessSessionInput) (CreateLivenessSessionOutput, error)
	GetSession(context.Context, SessionBinding) (LivenessSessionSnapshot, error)
	CancelSession(context.Context, SessionBinding) (LivenessSessionSnapshot, error)
}

type CreateLivenessSessionInput struct {
	VerificationID   uuid.UUID
	AttemptID        uuid.UUID
	ChallengeProfile ChallengeProfile
	CaptureProfile   CaptureProfile
	Lifetime         time.Duration
	AuditImageLimit  int
}

func (input CreateLivenessSessionInput) Validate() error {
	if input.VerificationID == uuid.Nil || input.AttemptID == uuid.Nil {
		return invalidLivenessContract("verification and attempt IDs are required")
	}
	if input.ChallengeProfile != ChallengeProfileMovementV1 {
		return invalidLivenessContract("challenge profile is unsupported")
	}
	if input.CaptureProfile != CaptureProfileWebV1 {
		return invalidLivenessContract("capture profile is unsupported")
	}
	if input.Lifetime <= 0 || input.Lifetime > 3*time.Minute {
		return invalidLivenessContract("session lifetime must be within 0..3 minutes")
	}
	if input.Lifetime%time.Second != 0 {
		return invalidLivenessContract("session lifetime must use whole seconds")
	}
	if input.AuditImageLimit < 0 || input.AuditImageLimit > 4 {
		return invalidLivenessContract("audit image limit must be within 0..4")
	}
	return nil
}

type SessionBinding struct {
	SessionID      string
	VerificationID uuid.UUID
	AttemptID      uuid.UUID
}

func (binding SessionBinding) Validate() error {
	sessionID := strings.TrimSpace(binding.SessionID)
	if sessionID == "" || len(sessionID) > 128 || strings.ContainsAny(sessionID, "/\\?#") {
		return invalidLivenessContract("session ID must be an opaque value of at most 128 characters")
	}
	if binding.VerificationID == uuid.Nil || binding.AttemptID == uuid.Nil {
		return invalidLivenessContract("verification and attempt IDs are required")
	}
	return nil
}

type CaptureConfiguration struct {
	Endpoint       string
	Token          string
	TokenExpiresAt time.Time
}

func (capture CaptureConfiguration) Validate(sessionID string, expiresAt time.Time) error {
	endpoint, err := url.Parse(capture.Endpoint)
	if err != nil || endpoint.Host == "" || (endpoint.Scheme != "ws" && endpoint.Scheme != "wss") {
		return invalidLivenessContract("capture endpoint must be an absolute WebSocket URL")
	}
	if endpoint.User != nil || endpoint.Fragment != "" {
		return invalidLivenessContract("capture endpoint must not contain credentials or a fragment")
	}
	if path.Base(strings.TrimRight(endpoint.Path, "/")) != sessionID {
		return invalidLivenessContract("capture endpoint is not bound to the session")
	}
	if strings.TrimSpace(capture.Token) == "" {
		return invalidLivenessContract("capture token is required")
	}
	if capture.TokenExpiresAt.IsZero() || capture.TokenExpiresAt.After(expiresAt) {
		return invalidLivenessContract("capture token must expire no later than the session")
	}
	return nil
}

type ChallengeDescriptor struct {
	Type    string
	Version string
}

func (challenge ChallengeDescriptor) Validate() error {
	if strings.TrimSpace(challenge.Type) == "" || strings.TrimSpace(challenge.Version) == "" {
		return invalidLivenessContract("challenge type and version are required")
	}
	return nil
}

type CreateLivenessSessionOutput struct {
	ContractVersion string
	Binding         SessionBinding
	Status          AttemptStatus
	ExpiresAt       time.Time
	Capture         CaptureConfiguration
	Challenge       ChallengeDescriptor
}

func (output CreateLivenessSessionOutput) Validate(expected CreateLivenessSessionInput) error {
	if err := expected.Validate(); err != nil {
		return err
	}
	if output.ContractVersion != IdentityAIContractVersion {
		return invalidLivenessContract("contract version is unsupported")
	}
	if err := output.Binding.Validate(); err != nil {
		return err
	}
	if output.Binding.VerificationID != expected.VerificationID ||
		output.Binding.AttemptID != expected.AttemptID {
		return invalidLivenessContract("created session binding does not match the request")
	}
	if output.Status != AttemptStatusCreated {
		return invalidLivenessContract("created session returned an unexpected status")
	}
	if output.ExpiresAt.IsZero() {
		return invalidLivenessContract("session expiry is required")
	}
	if err := output.Capture.Validate(output.Binding.SessionID, output.ExpiresAt); err != nil {
		return err
	}
	return output.Challenge.Validate()
}

type LivenessSessionFailure struct {
	Class     FailureClass
	Code      ReasonCode
	Retryable bool
}

func (failure LivenessSessionFailure) Validate() error {
	if !validFailureClass(failure.Class) || strings.TrimSpace(string(failure.Code)) == "" {
		return invalidLivenessContract("failure class and code are required")
	}
	return nil
}

type LivenessSessionResult struct {
	Evidence LivenessEvidenceSummary
}

func (result LivenessSessionResult) Validate() error {
	if err := result.Evidence.Validate(); err != nil {
		return fmt.Errorf("%w: result evidence: %v", ErrInvalidLivenessContract, err)
	}
	return nil
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

func (snapshot LivenessSessionSnapshot) Validate(expected SessionBinding) error {
	if snapshot.ContractVersion != IdentityAIContractVersion {
		return invalidLivenessContract("contract version is unsupported")
	}
	if err := expected.Validate(); err != nil {
		return err
	}
	if err := snapshot.Binding.Validate(); err != nil {
		return err
	}
	if snapshot.Binding != expected {
		return invalidLivenessContract("session response binding does not match the request")
	}
	if !validAttemptStatus(snapshot.Status) {
		return invalidLivenessContract("session status is unsupported")
	}
	if snapshot.ExpiresAt.IsZero() || snapshot.UpdatedAt.IsZero() {
		return invalidLivenessContract("session expiry and update time are required")
	}

	switch snapshot.Status {
	case AttemptStatusSucceeded:
		if snapshot.Result == nil || snapshot.CompletedAt == nil || snapshot.Failure != nil ||
			snapshot.FailedAt != nil || snapshot.ExpiredAt != nil || snapshot.CancelledAt != nil {
			return invalidLivenessContract("successful session has inconsistent result fields")
		}
		return snapshot.Result.Validate()
	case AttemptStatusFailed:
		if snapshot.Failure == nil || snapshot.FailedAt == nil || snapshot.Result != nil ||
			snapshot.CompletedAt != nil || snapshot.ExpiredAt != nil || snapshot.CancelledAt != nil {
			return invalidLivenessContract("failed session has inconsistent failure fields")
		}
		return snapshot.Failure.Validate()
	case AttemptStatusExpired:
		if snapshot.ExpiredAt == nil || snapshot.hasResultOrFailure() || snapshot.CompletedAt != nil ||
			snapshot.FailedAt != nil || snapshot.CancelledAt != nil {
			return invalidLivenessContract("expired session has inconsistent terminal fields")
		}
	case AttemptStatusCancelled:
		if snapshot.CancelledAt == nil || snapshot.hasResultOrFailure() ||
			snapshot.CompletedAt != nil || snapshot.FailedAt != nil || snapshot.ExpiredAt != nil {
			return invalidLivenessContract("cancelled session has inconsistent terminal fields")
		}
	default:
		if snapshot.Result != nil || snapshot.Failure != nil || snapshot.CompletedAt != nil ||
			snapshot.FailedAt != nil || snapshot.ExpiredAt != nil || snapshot.CancelledAt != nil {
			return invalidLivenessContract("active session contains terminal fields")
		}
	}
	return nil
}

func (snapshot LivenessSessionSnapshot) hasResultOrFailure() bool {
	return snapshot.Result != nil || snapshot.Failure != nil
}

func invalidLivenessContract(message string) error {
	return fmt.Errorf("%w: %s", ErrInvalidLivenessContract, message)
}
