package domain

import "time"

const (
	DefaultProvider         = "aws_ses"
	DefaultRegion           = "us-east-1"
	DefaultCustomReturnPath = "send"

	StatusPending  = "pending"
	StatusVerified = "verified"
	StatusFailed   = "failed"
	StatusDisabled = "disabled"

	RecordDKIM = "DKIM"
	RecordSPF  = "SPF"

	RecordTypeTXT = "TXT"
	RecordTypeMX  = "MX"

	RecordStatusPending  = "pending"
	RecordStatusVerified = "verified"
	RecordStatusFailed   = "failed"
)

type VerificationRecord struct {
	Record   string `json:"record"`
	Name     string `json:"name"`
	Value    string `json:"value"`
	Type     string `json:"type"`
	Status   string `json:"status"`
	TTL      string `json:"ttl"`
	Priority *int   `json:"priority,omitempty"`
}

type SenderDomain struct {
	ID                  string               `json:"id"`
	TeamID              string               `json:"team_id"`
	Domain              string               `json:"name"`
	Provider            string               `json:"provider,omitempty"`
	ProviderRegion      string               `json:"region"`
	Status              string               `json:"status"`
	VerificationRecords []VerificationRecord `json:"records"`
	FailureReason       *string              `json:"failure_reason,omitempty"`
	LastCheckedAt       *time.Time           `json:"last_checked_at,omitempty"`
	VerifiedAt          *time.Time           `json:"verified_at,omitempty"`
	DisabledAt          *time.Time           `json:"disabled_at,omitempty"`
	CreatedBy           *string              `json:"created_by,omitempty"`
	CreatedAt           time.Time            `json:"created_at"`
	UpdatedAt           time.Time            `json:"updated_at"`
}

type CreateRequest struct {
	Domain           string `json:"domain"`
	Region           string `json:"region"`
	CustomReturnPath string `json:"custom_return_path"`
}

type ProvisionRequest struct {
	Domain           string
	Region           string
	CustomReturnPath string
}

type ProviderStatus struct {
	IdentityVerified bool
	DKIMVerified     bool
	MailFromVerified bool
}
