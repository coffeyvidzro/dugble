package sms

import (
	"context"
	"encoding/json"
	"errors"
)

type Provider interface {
	Name() string
	Send(ctx context.Context, req SendRequest) (SendResult, error)
}

type SendRequest struct {
	MessageID   string
	TeamID      string
	From        string
	To          string
	Body        string
	CountryCode string
}

type SendResult struct {
	Provider          string
	ProviderMessageID string
	Status            Status
	RawResponse       json.RawMessage
}

type Status string

const (
	StatusAccepted Status = "accepted"
	StatusSent     Status = "sent"
	StatusFailed   Status = "failed"
	StatusUnknown  Status = "unknown"
)

type ProviderError struct {
	Provider   string
	Code       string
	Message    string
	Temporary  bool
	Retryable  bool
	FallbackOK bool
	Err        error
}

func (e *ProviderError) Error() string {
	if e.Err != nil {
		return e.Provider + ": " + e.Code + ": " + e.Message + ": " + e.Err.Error()
	}
	return e.Provider + ": " + e.Code + ": " + e.Message
}

func (e *ProviderError) Unwrap() error { return e.Err }

func IsFallbackAllowed(err error) bool {
	var providerErr *ProviderError
	return errors.As(err, &providerErr) && providerErr.FallbackOK
}
