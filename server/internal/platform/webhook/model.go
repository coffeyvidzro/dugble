package webhook

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

const (
	EventSMSSubmitted   = "sms.submitted"
	EventSMSSent        = "sms.sent"
	EventSMSDelivered   = "sms.delivered"
	EventSMSUndelivered = "sms.undelivered"
	EventSMSFailed      = "sms.failed"
	EventTest           = "webhook.test"
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
