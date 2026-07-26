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

type Recipient struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

type SendRequest struct {
	To             Recipient       `json:"to"`
	From           *Recipient      `json:"from,omitempty"`
	ReplyTo        string          `json:"reply_to,omitempty"`
	Subject        string          `json:"subject"`
	HTML           string          `json:"html,omitempty"`
	Text           string          `json:"text,omitempty"`
	Metadata       json.RawMessage `json:"metadata,omitempty"`
	IdempotencyKey string          `json:"-"`
}

type ListRequest struct {
	Limit  int32
	Offset int32
}

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
	IdempotencyKey    *string         `json:"-"`
	IdempotencyHash   *string         `json:"-"`
}

type MessageResponse struct {
	ID                string          `json:"id"`
	MessageType       string          `json:"message_type"`
	From              Recipient       `json:"from"`
	ReplyTo           string          `json:"reply_to,omitempty"`
	To                Recipient       `json:"to"`
	Subject           string          `json:"subject"`
	HTML              string          `json:"html,omitempty"`
	Text              string          `json:"text,omitempty"`
	Status            string          `json:"status"`
	ProviderMessageID *string         `json:"provider_message_id,omitempty"`
	Failure           *MessageFailure `json:"failure,omitempty"`
	Metadata          json.RawMessage `json:"metadata"`
	QueuedAt          time.Time       `json:"queued_at"`
	ProcessingAt      *time.Time      `json:"processing_at,omitempty"`
	SubmittedAt       *time.Time      `json:"submitted_at,omitempty"`
	DeliveredAt       *time.Time      `json:"delivered_at,omitempty"`
	FailedAt          *time.Time      `json:"failed_at,omitempty"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
}

type MessageFailure struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (m Message) Response() MessageResponse {
	response := MessageResponse{
		ID:                m.ID,
		MessageType:       m.MessageType,
		From:              recipientFromFields(m.FromEmail, m.FromName),
		To:                recipientFromFields(m.ToEmail, m.ToName),
		Subject:           m.Subject,
		Status:            m.Status,
		ProviderMessageID: m.ProviderMessageID,
		Metadata:          ensureMetadata(m.Metadata),
		QueuedAt:          m.QueuedAt,
		ProcessingAt:      m.ProcessingAt,
		SubmittedAt:       m.SubmittedAt,
		DeliveredAt:       m.DeliveredAt,
		FailedAt:          m.FailedAt,
		CreatedAt:         m.CreatedAt,
		UpdatedAt:         m.UpdatedAt,
	}
	if m.ReplyToEmail != nil {
		response.ReplyTo = *m.ReplyToEmail
	}
	if m.HTMLBody != nil {
		response.HTML = *m.HTMLBody
	}
	if m.TextBody != nil {
		response.Text = *m.TextBody
	}
	if m.ErrorCode != nil || m.ErrorMessage != nil {
		response.Failure = &MessageFailure{Code: "EMAIL_FAILED", Message: "Email delivery failed"}
		if m.ErrorCode != nil && *m.ErrorCode != "" {
			response.Failure.Code = *m.ErrorCode
		}
		if m.ErrorMessage != nil && *m.ErrorMessage != "" {
			response.Failure.Message = *m.ErrorMessage
		}
	}
	return response
}

func Responses(messages []Message) []MessageResponse {
	responses := make([]MessageResponse, len(messages))
	for index, message := range messages {
		responses[index] = message.Response()
	}
	return responses
}

func recipientFromFields(address string, name *string) Recipient {
	recipient := Recipient{Email: address}
	if name != nil {
		recipient.Name = *name
	}
	return recipient
}

func ensureMetadata(metadata json.RawMessage) json.RawMessage {
	if len(metadata) == 0 {
		return json.RawMessage(`{}`)
	}
	return metadata
}
