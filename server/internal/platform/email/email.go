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
	// MessageID and AttemptID are provider-neutral correlation identifiers. An
	// integration may attach them as provider metadata so asynchronous feedback
	// can reconcile a submission whose synchronous result could not be stored.
	MessageID string `json:"message_id,omitempty"`
	AttemptID string `json:"attempt_id,omitempty"`

	// Provider, Region, Stream, ConfigurationSet, and SESTenantName form the
	// immutable delivery route resolved when the application accepts a message.
	// Empty values are supported only for legacy and system messages, where the
	// sender's configured defaults are used.
	Provider         string `json:"provider,omitempty"`
	Region           string `json:"region,omitempty"`
	Stream           string `json:"stream,omitempty"`
	ConfigurationSet string `json:"configuration_set,omitempty"`
	SESTenantName    string `json:"ses_tenant_name,omitempty"`

	From        Address           `json:"from"`
	ReplyTo     []Address         `json:"reply_to,omitempty"`
	To          []Address         `json:"to"`
	CC          []Address         `json:"cc,omitempty"`
	BCC         []Address         `json:"bcc,omitempty"`
	Subject     string            `json:"subject"`
	HTML        string            `json:"html,omitempty"`
	Text        string            `json:"text,omitempty"`
	Headers     map[string]string `json:"headers,omitempty"`
	Attachments []Attachment      `json:"attachments,omitempty"`
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
	Code              string
	Retryable         bool
	SubmissionUnknown bool
	Err               error
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

// NewSubmissionUnknownError reports that the provider may have accepted the
// message, but the caller did not receive a definitive submission result.
func NewSubmissionUnknownError(code string, err error) error {
	return &SendError{
		Code:              normalizeCode(code),
		SubmissionUnknown: true,
		Err:               err,
	}
}

// IsSubmissionUnknown reports whether retrying could duplicate a provider
// submission. Bare cancellations, deadlines, and network errors are treated
// conservatively because they may happen after the request crossed the network.
func IsSubmissionUnknown(err error) bool {
	if err == nil {
		return false
	}
	var sendError *SendError
	if errors.As(err, &sendError) {
		return sendError.SubmissionUnknown
	}
	if errors.Is(err, context.Canceled) || errors.Is(err, context.DeadlineExceeded) {
		return true
	}
	var networkError net.Error
	return errors.As(err, &networkError)
}

func IsRetryable(err error) bool {
	if err == nil || IsSubmissionUnknown(err) {
		return false
	}
	var sendError *SendError
	if errors.As(err, &sendError) {
		return sendError.Retryable
	}
	return false
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
