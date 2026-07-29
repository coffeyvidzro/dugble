package sesevents

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

const maxRequestSize = 256 << 10

var eventNamespace = uuid.MustParse("54e3cc79-82fb-4c2c-a095-56c6ec77c981")

// Event is the versioned, provider-neutral envelope persisted in JetStream.
type Event struct {
	EventID                uuid.UUID       `json:"event_id"`
	SchemaVersion          int             `json:"schema_version"`
	Provider               string          `json:"provider"`
	Transport              string          `json:"transport"`
	TopicARN               string          `json:"topic_arn"`
	ProviderNotificationID string          `json:"provider_notification_id"`
	ReceivedAt             time.Time       `json:"received_at"`
	Payload                json.RawMessage `json:"payload"`
}

// EventType is Dugble's normalized representation of an Amazon SES event type.
type EventType string

const (
	EventTypeSend             EventType = "send"
	EventTypeDelivery         EventType = "delivery"
	EventTypeDeliveryDelay    EventType = "delivery_delay"
	EventTypeBounce           EventType = "bounce"
	EventTypeComplaint        EventType = "complaint"
	EventTypeReject           EventType = "reject"
	EventTypeRenderingFailure EventType = "rendering_failure"
)

// ProviderEvent contains the normalized SES lifecycle data used by downstream workers.
type ProviderEvent struct {
	Type              EventType                `json:"type"`
	ProviderMessageID string                   `json:"provider_message_id"`
	OccurredAt        time.Time                `json:"occurred_at"`
	Recipients        []Recipient              `json:"recipients"`
	Bounce            *BounceDetails           `json:"bounce,omitempty"`
	Complaint         *ComplaintDetails        `json:"complaint,omitempty"`
	Delivery          *DeliveryDetails         `json:"delivery,omitempty"`
	Delay             *DelayDetails            `json:"delay,omitempty"`
	Reject            *RejectDetails           `json:"reject,omitempty"`
	RenderingFailure  *RenderingFailureDetails `json:"rendering_failure,omitempty"`
}

type Recipient struct {
	Email          string `json:"email"`
	Action         string `json:"action,omitempty"`
	Status         string `json:"status,omitempty"`
	DiagnosticCode string `json:"diagnostic_code,omitempty"`
}

type BounceDetails struct {
	Type         string `json:"type"`
	Subtype      string `json:"subtype"`
	FeedbackID   string `json:"feedback_id,omitempty"`
	ReportingMTA string `json:"reporting_mta,omitempty"`
}

type ComplaintDetails struct {
	Subtype      string     `json:"subtype,omitempty"`
	FeedbackType string     `json:"feedback_type,omitempty"`
	FeedbackID   string     `json:"feedback_id,omitempty"`
	UserAgent    string     `json:"user_agent,omitempty"`
	ArrivalAt    *time.Time `json:"arrival_at,omitempty"`
}

type DeliveryDetails struct {
	ProcessingTimeMillis int64  `json:"processing_time_millis"`
	SMTPResponse         string `json:"smtp_response,omitempty"`
	ReportingMTA         string `json:"reporting_mta,omitempty"`
	RemoteMTAIP          string `json:"remote_mta_ip,omitempty"`
}

type DelayDetails struct {
	Type         string     `json:"type"`
	ExpirationAt *time.Time `json:"expiration_at,omitempty"`
	ReportingMTA string     `json:"reporting_mta,omitempty"`
}

type RejectDetails struct {
	Reason string `json:"reason"`
}

type RenderingFailureDetails struct {
	TemplateName string `json:"template_name,omitempty"`
	ErrorMessage string `json:"error_message"`
}
