package domain

import (
	"encoding/json"
	"time"
)

const (
	DefaultProvider = "aws_ses"

	StatusPending  = "pending"
	StatusVerified = "verified"
	StatusFailed   = "failed"
	StatusDisabled = "disabled"
)

type SenderDomain struct {
	ID                  string          `json:"id"`
	TeamID              string          `json:"team_id"`
	Domain              string          `json:"domain"`
	Provider            string          `json:"provider"`
	ProviderRegion      string          `json:"provider_region"`
	Status              string          `json:"status"`
	VerificationRecords json.RawMessage `json:"verification_records"`
	FailureReason       *string         `json:"failure_reason,omitempty"`
	LastCheckedAt       *time.Time      `json:"last_checked_at,omitempty"`
	VerifiedAt          *time.Time      `json:"verified_at,omitempty"`
	DisabledAt          *time.Time      `json:"disabled_at,omitempty"`
	CreatedBy           *string         `json:"created_by,omitempty"`
	CreatedAt           time.Time       `json:"created_at"`
	UpdatedAt           time.Time       `json:"updated_at"`
}

type CreateRequest struct {
	Domain         string `json:"domain"`
	Provider       string `json:"provider"`
	ProviderRegion string `json:"provider_region"`
}
