package identity

import "context"

// LivenessClient is the private control-plane boundary consumed by the identity service.
// Implementations translate these semantic types to the Identity AI transport contract.
type LivenessClient interface {
	CreateSession(context.Context, CreateLivenessSessionInput) (CreateLivenessSessionOutput, error)
	GetSession(context.Context, SessionBinding) (LivenessSessionSnapshot, error)
	CancelSession(context.Context, SessionBinding) (LivenessSessionSnapshot, error)
}
