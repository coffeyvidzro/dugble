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
