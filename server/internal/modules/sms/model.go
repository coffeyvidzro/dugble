package sms

import (
	"bytes"
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
)

type Message struct {
	ID                 string          `json:"id"`
	TeamID             string          `json:"team_id"`
	SenderID           *string         `json:"sender_id,omitempty"`
	To                 string          `json:"to"`
	From               string          `json:"from"`
	Body               string          `json:"body"`
	Status             string          `json:"status"`
	ProviderID         *string         `json:"provider_id,omitempty"`
	ProviderMessageID  *string         `json:"provider_message_id,omitempty"`
	Segments           int32           `json:"segments"`
	CostMicros         int64           `json:"cost_micros"`
	Billing            Billing         `json:"billing"`
	ErrorMessage       *string         `json:"error_message,omitempty"`
	Metadata           json.RawMessage `json:"metadata"`
	Tags               []Tag           `json:"tags"`
	SubmittedAt        *time.Time      `json:"submitted_at,omitempty"`
	DeliveredAt        *time.Time      `json:"delivered_at,omitempty"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
	DestinationCountry string          `json:"destination_country"`
	PricingRuleID      string          `json:"pricing_rule_id"`
	UnitCostMicros     int64           `json:"unit_cost_micros"`
}

type Destination struct {
	Country string `json:"country"`
}

type SMSResponse struct {
	Object      string          `json:"object"`
	ID          string          `json:"id"`
	MessageID   *string         `json:"message_id"`
	To          string          `json:"to"`
	From        string          `json:"from"`
	Body        string          `json:"body"`
	Status      string          `json:"last_event"`
	Destination Destination     `json:"destination"`
	Segments    int32           `json:"segments"`
	Metadata    json.RawMessage `json:"metadata"`
	Tags        []Tag           `json:"tags"`
	Billing     Billing         `json:"billing"`
	Failure     *SMSFailure     `json:"failure,omitempty"`
	SubmittedAt *time.Time      `json:"submitted_at,omitempty"`
	DeliveredAt *time.Time      `json:"delivered_at,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type SMSFailure struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (m Message) Response() SMSResponse {
	return SMSResponse{
		Object:      "sms",
		ID:          m.ID,
		MessageID:   m.ProviderMessageID,
		To:          m.To,
		From:        m.From,
		Body:        m.Body,
		Status:      m.Status,
		Destination: Destination{Country: m.DestinationCountry},
		Segments:    m.Segments,
		Metadata:    m.Metadata,
		Tags:        nonNilSMSTags(m.Tags),
		Billing:     m.Billing,
		Failure:     publicFailure(m.Status),
		SubmittedAt: m.SubmittedAt,
		DeliveredAt: m.DeliveredAt,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}

func Responses(messages []Message) []SMSResponse {
	responses := make([]SMSResponse, len(messages))
	for index, message := range messages {
		responses[index] = message.Response()
	}
	return responses
}

func publicFailure(status string) *SMSFailure {
	switch status {
	case StatusRefundPending:
		return &SMSFailure{Code: "SMS_REFUND_PENDING", Message: "SMS delivery failed and the refund is being processed"}
	case StatusUndelivered:
		return &SMSFailure{Code: "SMS_UNDELIVERED", Message: "SMS could not be delivered"}
	case StatusRejected:
		return &SMSFailure{Code: "SMS_REJECTED", Message: "SMS was rejected"}
	case StatusFailed:
		return &SMSFailure{Code: "SMS_FAILED", Message: "SMS delivery failed"}
	case StatusExpired:
		return &SMSFailure{Code: "SMS_EXPIRED", Message: "SMS delivery expired"}
	default:
		return nil
	}
}

type Billing struct {
	UnitCost  float64 `json:"unit_cost"`
	TotalCost float64 `json:"total_cost"`
	Currency  string  `json:"currency"`
}

type SendRequest struct {
	To                 string          `json:"to"`
	From               string          `json:"from"`
	Body               string          `json:"body"`
	Metadata           json.RawMessage `json:"metadata,omitempty"`
	Tags               []Tag           `json:"tags,omitempty"`
	DestinationCountry string          `json:"-"`
}

type BatchSendRequest struct {
	Messages []SendRequest `json:"messages"`
}

func (request *BatchSendRequest) UnmarshalJSON(data []byte) error {
	data = bytes.TrimSpace(data)
	if len(data) > 0 && data[0] == '[' {
		return json.Unmarshal(data, &request.Messages)
	}
	type alias BatchSendRequest
	return json.Unmarshal(data, (*alias)(request))
}

type Tag struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type SendResponse struct {
	Object string `json:"object"`
	ID     string `json:"id"`
}

func (m Message) SendResponse() SendResponse { return SendResponse{Object: "sms", ID: m.ID} }

func nonNilSMSTags(tags []Tag) []Tag {
	if tags == nil {
		return []Tag{}
	}
	return tags
}

type BatchSendError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type BatchSendResult struct {
	Index   int             `json:"index"`
	Success bool            `json:"success"`
	Message *SMSResponse    `json:"message,omitempty"`
	Error   *BatchSendError `json:"error,omitempty"`
}

type BatchSendSummary struct {
	Requested int `json:"requested"`
	Succeeded int `json:"succeeded"`
	Failed    int `json:"failed"`
}

type BatchSendResponse struct {
	Results []BatchSendResult `json:"results"`
	Summary BatchSendSummary  `json:"summary"`
}

type ListRequest struct {
	Limit  int32
	Offset int32
}
