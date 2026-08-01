package emailtenant

import "time"

const (
	ProviderAWSSES = "aws_ses"

	StatusPending      = "pending"
	StatusProvisioning = "provisioning"
	StatusActive       = "active"
	StatusPaused       = "paused"
	StatusDeleting     = "deleting"
	StatusFailed       = "failed"

	SuppressionScopeAccount = "account"
	SuppressionScopeTenant  = "tenant"

	ReputationPolicyNone     = "none"
	ReputationPolicyStandard = "standard"
	ReputationPolicyStrict   = "strict"
)

// Tenant is the provider-neutral record that binds a Dugble team to an email
// provider's regional tenant or reputation-isolation boundary.
type Tenant struct {
	ID               string    `json:"id"`
	TeamID           string    `json:"team_id"`
	Provider         string    `json:"provider"`
	Region           string    `json:"region"`
	ExternalName     string    `json:"external_name"`
	ExternalID       *string   `json:"external_id,omitempty"`
	Status           string    `json:"status"`
	SuppressionScope string    `json:"suppression_scope"`
	ReputationPolicy string    `json:"reputation_policy"`
	FailureReason    *string   `json:"failure_reason,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// CreateParams contains server-owned values used to reserve an email tenant
// before asynchronous provider provisioning begins.
type CreateParams struct {
	TeamID           string
	Provider         string
	Region           string
	ExternalName     string
	SuppressionScope string
	ReputationPolicy string
}
