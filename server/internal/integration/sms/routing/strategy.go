package routing

import (
	"context"
	"errors"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

type Strategy interface {
	Order(
		ctx context.Context,
		req sms.SendRequest,
		routes []Route,
	) []Route

	ShouldFallback(
		ctx context.Context,
		providerID string,
		err error,
	) bool
}

// SafeFallbackError is implemented by provider errors only when the upstream
// definitely rejected the request before accepting the SMS.
type SafeFallbackError interface {
	error
	SafeToFallback() bool
}

type PriorityStrategy struct{}

func NewPriorityStrategy() *PriorityStrategy {
	return &PriorityStrategy{}
}

func (s *PriorityStrategy) Order(
	_ context.Context,
	_ sms.SendRequest,
	routes []Route,
) []Route {
	ordered := make([]Route, len(routes))
	copy(ordered, routes)

	return ordered
}

func (s *PriorityStrategy) ShouldFallback(
	_ context.Context,
	_ string,
	err error,
) bool {
	if err == nil {
		return false
	}

	var fallbackError SafeFallbackError
	if !errors.As(err, &fallbackError) {
		// A timeout, connection reset, decode failure, or unknown error may
		// have happened after the provider accepted the SMS.
		return false
	}

	return fallbackError.SafeToFallback()
}
