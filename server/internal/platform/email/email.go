package email

import (
	"context"
	"errors"
	"net"
	"strings"
)

const (
	RecordDKIM = "DKIM"
	RecordSPF  = "SPF"

	RecordTypeTXT = "TXT"
	RecordTypeMX  = "MX"

	RecordStatusPending  = "pending"
	RecordStatusVerified = "verified"
	RecordStatusFailed   = "failed"
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

// VerificationRecord is a provider-neutral DNS record required to authenticate a sender domain.
type VerificationRecord struct {
	Record   string `json:"record"`
	Name     string `json:"name"`
	Value    string `json:"value"`
	Type     string `json:"type"`
	Status   string `json:"status"`
	TTL      string `json:"ttl"`
	Priority *int   `json:"priority,omitempty"`
}

// DomainProvisionRequest describes a sender domain that an email integration should provision.
type DomainProvisionRequest struct {
	Domain           string
	Region           string
	CustomReturnPath string
}

// DomainStatus contains provider-side sender-domain verification state.
type DomainStatus struct {
	IdentityVerified bool
	DKIMVerified     bool
	MailFromVerified bool
}

// DomainProvider is implemented by integrations that provision and inspect sender identities.
type DomainProvider interface {
	ProvisionDomain(context.Context, DomainProvisionRequest) ([]VerificationRecord, error)
	GetDomainStatus(context.Context, string, string) (DomainStatus, error)
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
