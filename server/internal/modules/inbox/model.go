package inbox

import (
	"encoding/json"
	"time"
)

const (
	PriorityLow    = "low"
	PriorityNormal = "normal"
	PriorityHigh   = "high"
	PriorityUrgent = "urgent"

	ActionStylePrimary   = "primary"
	ActionStyleSecondary = "secondary"
	ActionStyleDanger    = "danger"
	ActionStyleLink      = "link"
)

type Action struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	URL   string `json:"url"`
	Style string `json:"style,omitempty"`
}

type CreateMessageRequest struct {
	Recipients []string        `json:"recipients"`
	Category   string          `json:"category"`
	Priority   string          `json:"priority"`
	Title      string          `json:"title"`
	Body       string          `json:"body"`
	Data       json.RawMessage `json:"data"`
	Actions    []Action        `json:"actions"`
}

type Message struct {
	ID             string          `json:"id"`
	TeamID         string          `json:"team_id"`
	Category       string          `json:"category"`
	Priority       string          `json:"priority"`
	Title          string          `json:"title"`
	Body           string          `json:"body"`
	Data           json.RawMessage `json:"data"`
	Actions        []Action        `json:"actions"`
	Source         string          `json:"source"`
	SourceID       *string         `json:"source_id,omitempty"`
	RecipientCount int             `json:"recipient_count,omitempty"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

type ListRequest struct {
	Limit  int32
	Offset int32
}

type validatedCreateMessage struct {
	Recipients []string
	Category   string
	Priority   string
	Title      string
	Body       string
	Data       []byte
	Actions    []byte
}
