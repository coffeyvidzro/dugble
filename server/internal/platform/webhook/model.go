package webhook

import (
	"encoding/json"
	"slices"
	"time"

	"github.com/google/uuid"
)

var subscribableEventTypes = []string{
	EventSMSSubmitted,
	EventSMSSent,
	EventSMSDelivered,
	EventSMSUndelivered,
	EventSMSFailed,
	EventEmailSubmitted,
	EventEmailDelivered,
	EventEmailDelayed,
	EventEmailBounced,
	EventEmailComplained,
	EventEmailRejected,
	EventEmailFailed,
}

func SubscribableEventTypes() []string {
	return slices.Clone(subscribableEventTypes)
}

func IsSubscribableEventType(eventType string) bool {
	return slices.Contains(subscribableEventTypes, eventType)
}

const (
	EventSMSSubmitted   = "sms.submitted"
	EventSMSSent        = "sms.sent"
	EventSMSDelivered   = "sms.delivered"
	EventSMSUndelivered = "sms.undelivered"
	EventSMSFailed      = "sms.failed"

	EventEmailSubmitted  = "email.submitted"
	EventEmailDelivered  = "email.delivered"
	EventEmailDelayed    = "email.delayed"
	EventEmailBounced    = "email.bounced"
	EventEmailComplained = "email.complained"
	EventEmailRejected   = "email.rejected"
	EventEmailFailed     = "email.failed"

	EventTest = "webhook.test"
)

type Event struct {
	ID         uuid.UUID
	TeamID     uuid.UUID
	Type       string
	ObjectType string
	ObjectID   *uuid.UUID
	Payload    json.RawMessage
	OccurredAt time.Time
}
