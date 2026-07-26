package email

import (
	"encoding/json"
	"time"
)

const (
	StatusQueued     = "queued"
	StatusProcessing = "processing"
	StatusSubmitted  = "submitted"
	StatusDelivered  = "delivered"
	StatusDelayed    = "delayed"
	StatusBounced    = "bounced"
	StatusComplained = "complained"
	StatusRejected   = "rejected"
	StatusFailed     = "failed"
)

const MessageTypeTransactional = "transactional"

type Message struct {
	ID                string          `json:"id"`
	TeamID            string          `json:"team_id"`
	MessageType       string          `json:"message_type"`
	FromEmail         string          `json:"from_email"`
	FromName          *string         `json:"from_name,omitempty"`
	ReplyToEmail      *string         `json:"reply_to_email,omitempty"`
	ToEmail           string          `json:"to_email"`
	ToName            *string         `json:"to_name,omitempty"`
	Subject           string          `json:"subject"`
	HTMLBody          *string         `json:"html_body,omitempty"`
	TextBody          *string         `json:"text_body,omitempty"`
	Status            string          `json:"status"`
	Provider          *string         `json:"provider,omitempty"`
	ProviderMessageID *string         `json:"provider_message_id,omitempty"`
	ErrorCode         *string         `json:"error_code,omitempty"`
	ErrorMessage      *string         `json:"error_message,omitempty"`
	Metadata          json.RawMessage `json:"metadata"`
	QueuedAt          time.Time       `json:"queued_at"`
	ProcessingAt      *time.Time      `json:"processing_at,omitempty"`
	SubmittedAt       *time.Time      `json:"submitted_at,omitempty"`
	DeliveredAt       *time.Time      `json:"delivered_at,omitempty"`
	FailedAt          *time.Time      `json:"failed_at,omitempty"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
}

type SendRequest struct {
	From     *EmailAddress   `json:"from,omitempty"`
	ReplyTo  string          `json:"reply_to,omitempty"`
	To       EmailAddress    `json:"to"`
	Subject  string          `json:"subject"`
	HTML     string          `json:"html,omitempty"`
	Text     string          `json:"text,omitempty"`
	Metadata json.RawMessage `json:"metadata,omitempty"`
}

type EmailAddress struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

type BatchSendRequest struct {
	Messages []SendRequest `json:"messages"`
}
type ListRequest struct{ Limit, Offset int32 }
