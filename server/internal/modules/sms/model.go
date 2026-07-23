package sms

import (
	"encoding/json"
	"time"
)

const (
	StatusQueued        = "queued"
	StatusProcessing    = "processing"
	StatusRefundPending = "refund_pending"
	StatusSubmitted     = "submitted"
	StatusSent          = "sent"
	StatusDelivered     = "delivered"
	StatusUndelivered   = "undelivered"
	StatusRejected      = "rejected"
	StatusFailed        = "failed"
	StatusExpired       = "expired"
	StatusUnknown       = "unknown"

	defaultCostMicrosPerSegment int64 = 9_000
)

type Message struct {
	ID                string          `json:"id"`
	TeamID            string          `json:"team_id"`
	SenderID          *string         `json:"sender_id,omitempty"`
	To                string          `json:"to"`
	From              string          `json:"from"`
	Body              string          `json:"body"`
	Status            string          `json:"status"`
	ProviderID        *string         `json:"provider_id,omitempty"`
	ProviderMessageID *string         `json:"provider_message_id,omitempty"`
	Segments          int32           `json:"segments"`
	CostMicros        int64           `json:"cost_micros"`
	ClientReference   *string         `json:"client_reference,omitempty"`
	ErrorMessage      *string         `json:"error_message,omitempty"`
	Metadata          json.RawMessage `json:"metadata"`
	SubmittedAt       *time.Time      `json:"submitted_at,omitempty"`
	DeliveredAt       *time.Time      `json:"delivered_at,omitempty"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
}

type SendRequest struct {
	To              string          `json:"to"`
	From            string          `json:"from"`
	Body            string          `json:"body"`
	ClientReference *string         `json:"client_reference,omitempty"`
	Metadata        json.RawMessage `json:"metadata,omitempty"`
}

type ListRequest struct {
	Limit  int32
	Offset int32
}
