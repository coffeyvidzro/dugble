package sms

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"unicode/utf8"
)

const MaxSenderIDCharacters = 11

const (
	TrafficClassLocal = "local"
	TrafficClassA2P   = "a2p"
)

const (
	StatusQueued      = "queued"
	StatusSubmitted   = "submitted"
	StatusSent        = "sent"
	StatusDelivered   = "delivered"
	StatusUndelivered = "undelivered"
	StatusRejected    = "rejected"
	StatusFailed      = "failed"
	StatusExpired     = "expired"
	StatusUnknown     = "unknown"
)

var (
	ErrRouterRequired       = errors.New("sms router is required")
	ErrNoProviderAvailable  = errors.New("no SMS provider is available")
	ErrProviderNotFound     = errors.New("SMS provider not found")
	ErrInvalidProviderReply = errors.New("invalid SMS provider response")
)

// SendRequest is Dugble's provider-neutral request for one recipient.
// Batching can be added later without changing the provider implementations by
// introducing a separate batch request type.
type SendRequest struct {
	To           string
	From         string
	Message      string
	TrafficClass string
}

// Normalize trims routing fields while preserving the message exactly as the
// caller supplied it. Requests created by older callers default to A2P so they
// cannot accidentally enter a cheaper local route.
func (r SendRequest) Normalize() SendRequest {
	r.To = strings.TrimSpace(r.To)
	r.From = strings.TrimSpace(r.From)
	r.TrafficClass = NormalizeTrafficClass(r.TrafficClass)
	if r.TrafficClass == "" {
		r.TrafficClass = TrafficClassA2P
	}
	return r
}

func (r SendRequest) Validate() error {
	r = r.Normalize()

	if r.To == "" {
		return &ValidationError{Field: "to", Reason: "recipient is required"}
	}
	if r.From == "" {
		return &ValidationError{Field: "from", Reason: "sender ID is required"}
	}
	if utf8.RuneCountInString(r.From) > MaxSenderIDCharacters {
		return &ValidationError{
			Field:  "from",
			Reason: fmt.Sprintf("sender ID must not exceed %d characters", MaxSenderIDCharacters),
		}
	}
	if strings.TrimSpace(r.Message) == "" {
		return &ValidationError{Field: "message", Reason: "message is required"}
	}
	if !IsKnownTrafficClass(r.TrafficClass) {
		return &ValidationError{Field: "traffic_class", Reason: "traffic class must be local or a2p"}
	}

	return nil
}

func NormalizeTrafficClass(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func IsKnownTrafficClass(value string) bool {
	switch NormalizeTrafficClass(value) {
	case TrafficClassLocal, TrafficClassA2P:
		return true
	default:
		return false
	}
}

type SendResponse struct {
	ProviderID    string
	ProviderMsgID string
	Status        string
}

type StatusResponse struct {
	ProviderID    string
	ProviderMsgID string
	Status        string
}

// Provider is implemented by every upstream SMS adapter.
//
// It lives in the root sms package to prevent an import cycle. The
// sms/provider package exposes an alias for packages that prefer the
// provider.Provider name.
type Provider interface {
	ID() string
	Send(ctx context.Context, req SendRequest) (*SendResponse, error)
	CheckStatus(ctx context.Context, providerMessageID string) (*StatusResponse, error)
}

// Router owns provider ordering, provider lookup, and the decision about
// whether a failed request is safe to retry through the next provider.
type Router interface {
	Route(ctx context.Context, req SendRequest) ([]Provider, error)
	Provider(providerID string) (Provider, bool)
	ShouldFallback(ctx context.Context, providerID string, err error) bool
}

type ValidationError struct {
	Field  string
	Reason string
}

func (e *ValidationError) Error() string {
	if e == nil {
		return "invalid SMS request"
	}
	if e.Field == "" {
		return "invalid SMS request: " + e.Reason
	}
	return fmt.Sprintf("invalid SMS request field %q: %s", e.Field, e.Reason)
}

// ProviderAttempt records one failed upstream attempt. It intentionally does
// not expose provider errors in a customer-facing response.
type ProviderAttempt struct {
	ProviderID string
	Err        error
}

// SendError reports all attempted providers when an SMS could not be
// submitted. errors.Is/errors.As can still inspect every underlying error via
// Unwrap.
type SendError struct {
	Attempts []ProviderAttempt
}

func (e *SendError) Error() string {
	if e == nil || len(e.Attempts) == 0 {
		return "SMS send failed"
	}

	last := e.Attempts[len(e.Attempts)-1]
	if last.Err == nil {
		return fmt.Sprintf("SMS send failed via %s", last.ProviderID)
	}
	return fmt.Sprintf("SMS send failed via %s: %v", last.ProviderID, last.Err)
}

func (e *SendError) Unwrap() []error {
	if e == nil {
		return nil
	}

	errs := make([]error, 0, len(e.Attempts))
	for _, attempt := range e.Attempts {
		if attempt.Err != nil {
			errs = append(errs, attempt.Err)
		}
	}
	return errs
}

func IsKnownStatus(status string) bool {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case StatusQueued,
		StatusSubmitted,
		StatusSent,
		StatusDelivered,
		StatusUndelivered,
		StatusRejected,
		StatusFailed,
		StatusExpired,
		StatusUnknown:
		return true
	default:
		return false
	}
}
