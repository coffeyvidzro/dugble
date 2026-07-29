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
	Type              EventType
	ProviderMessageID string
	OccurredAt        time.Time
	Recipients        []Recipient
	Bounce            *BounceDetails
	Complaint         *ComplaintDetails
	Delivery          *DeliveryDetails
	Delay             *DelayDetails
	Reject            *RejectDetails
	RenderingFailure  *RenderingFailureDetails
}

type Recipient struct {
	Email          string
	Action         string
	Status         string
	DiagnosticCode string
}

type BounceDetails struct {
	Type         string
	Subtype      string
	FeedbackID   string
	ReportingMTA string
}

type ComplaintDetails struct {
	Subtype      string
	FeedbackType string
	FeedbackID   string
	UserAgent    string
	ArrivalAt    *time.Time
}

type DeliveryDetails struct {
	ProcessingTimeMillis int64
	SMTPResponse         string
	ReportingMTA         string
	RemoteMTAIP          string
}

type DelayDetails struct {
	Type         string
	ExpirationAt *time.Time
	ReportingMTA string
}

type RejectDetails struct {
	Reason string
}

type RenderingFailureDetails struct {
	TemplateName string
	ErrorMessage string
}
