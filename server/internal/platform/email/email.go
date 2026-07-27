package email

import (
	"context"
	"errors"
	"net"
	"strings"
)

// Address is a provider-neutral email address.
type Address struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

// Attachment is a provider-neutral email attachment. Content is base64 encoded.
type Attachment struct {
	Content     string `json:"content,omitempty"`
	Filename    string `json:"filename,omitempty"`
	Path        string `json:"path,omitempty"`
	ContentType string `json:"content_type,omitempty"`
	ContentID   string `json:"content_id,omitempty"`
}

// Message is the canonical message accepted by email integrations.
type Message struct {
	From        Address
	ReplyTo     []Address
	To          []Address
	CC          []Address
	BCC         []Address
	Subject     string
	HTML        string
	Text        string
	Headers     map[string]string
	Attachments []Attachment
}

// Result identifies a message accepted by an email provider.
type Result struct {
	Provider  string
	MessageID string
}

// Sender is implemented by email integrations such as AWS SES.
type Sender interface {
	Send(context.Context, Message) (Result, error)
}

// SendError exposes provider-neutral failure metadata to delivery workers.
type SendError struct {
	Code      string
	Retryable bool
	Err       error
}

func (e *SendError) Error() string {
	if e == nil || e.Err == nil {
		return "email send failed"
	}
	return e.Err.Error()
}

func (e *SendError) Unwrap() error {
	if e == nil {
		return nil
	}
	return e.Err
}

func NewSendError(code string, retryable bool, err error) error {
	return &SendError{
		Code:      normalizeCode(code),
		Retryable: retryable,
		Err:       err,
	}
}

func IsRetryable(err error) bool {
	if err == nil || errors.Is(err, context.Canceled) {
		return false
	}
	if errors.Is(err, context.DeadlineExceeded) {
		return true
	}
	var sendError *SendError
	if errors.As(err, &sendError) {
		return sendError.Retryable
	}
	var networkError net.Error
	return errors.As(err, &networkError)
}

func FailureCode(err error) string {
	var sendError *SendError
	if errors.As(err, &sendError) && sendError.Code != "" {
		return sendError.Code
	}
	return "provider_rejected"
}

func normalizeCode(code string) string {
	code = strings.ToLower(strings.TrimSpace(code))
	code = strings.ReplaceAll(code, "-", "_")
	code = strings.ReplaceAll(code, " ", "_")
	return code
}
