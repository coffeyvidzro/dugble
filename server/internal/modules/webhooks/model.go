package webhooks

import (
	"encoding/json"
	"time"
)

const DefaultAPIVersion = "2026-07-01"

const (
	EventSMSSubmitted   = "sms.submitted"
	EventSMSSent        = "sms.sent"
	EventSMSDelivered   = "sms.delivered"
	EventSMSUndelivered = "sms.undelivered"
	EventSMSFailed      = "sms.failed"
)

const (
	DeliveryPending   = "pending"
	DeliveryRetrying  = "retrying"
	DeliverySucceeded = "succeeded"
	DeliveryFailed    = "failed"
)

type Endpoint struct {
	ID               string     `json:"id"`
	TeamID           string     `json:"team_id"`
	URL              string     `json:"url"`
	Description      *string    `json:"description,omitempty"`
	Enabled          bool       `json:"enabled"`
	SubscribedEvents []string   `json:"subscribed_events"`
	APIVersion       string     `json:"api_version"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	DisabledAt       *time.Time `json:"disabled_at,omitempty"`
}

type CreatedEndpoint struct {
	Endpoint
	SigningSecret string `json:"signing_secret"`
}

type Event struct {
	ID         string          `json:"id"`
	TeamID     string          `json:"team_id"`
	Type       string          `json:"type"`
	ObjectType string          `json:"object_type"`
	ObjectID   *string         `json:"object_id,omitempty"`
	APIVersion string          `json:"api_version"`
	Payload    json.RawMessage `json:"payload"`
	OccurredAt time.Time       `json:"occurred_at"`
	CreatedAt  time.Time       `json:"created_at"`
}

type Delivery struct {
	ID             string     `json:"id"`
	EventID        string     `json:"event_id"`
	EndpointID     string     `json:"endpoint_id"`
	Status         string     `json:"status"`
	AttemptCount   int32      `json:"attempt_count"`
	NextAttemptAt  time.Time  `json:"next_attempt_at"`
	LastAttemptAt  *time.Time `json:"last_attempt_at,omitempty"`
	ResponseStatus *int32     `json:"response_status,omitempty"`
	ResponseBody   *string    `json:"response_body,omitempty"`
	LastError      *string    `json:"last_error,omitempty"`
	DeliveredAt    *time.Time `json:"delivered_at,omitempty"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type CreateEndpointRequest struct {
	URL              string   `json:"url"`
	Description      *string  `json:"description,omitempty"`
	SubscribedEvents []string `json:"subscribed_events"`
	APIVersion       string   `json:"api_version,omitempty"`
}

type UpdateEndpointRequest struct {
	URL              *string   `json:"url,omitempty"`
	Description      *string   `json:"description,omitempty"`
	Enabled          *bool     `json:"enabled,omitempty"`
	SubscribedEvents *[]string `json:"subscribed_events,omitempty"`
	APIVersion       *string   `json:"api_version,omitempty"`
}

type ListRequest struct {
	Limit  int32
	Offset int32
}
