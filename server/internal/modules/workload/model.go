package workload

import "time"

const (
	CredentialPrefix  = "dgb_wc_"
	AccessTokenPrefix = "dgb_wa_"
)

type Identity struct {
	ID          string     `json:"id"`
	TeamID      string     `json:"team_id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	Permissions []string   `json:"permissions"`
	CreatedBy   *string    `json:"created_by,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DisabledAt  *time.Time `json:"disabled_at,omitempty"`
}

type MutationRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Permissions []string `json:"permissions"`
}
type CredentialRequest struct {
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}
type CreatedCredential struct {
	ID           string    `json:"id"`
	WorkloadID   string    `json:"workload_id"`
	SecretPrefix string    `json:"secret_prefix"`
	Secret       string    `json:"secret"`
	ExpiresAt    time.Time `json:"expires_at"`
}
type ExchangeRequest struct {
	Credential string `json:"credential"`
}
type AccessToken struct {
	AccessToken string    `json:"access_token"`
	TokenType   string    `json:"token_type"`
	ExpiresIn   int64     `json:"expires_in"`
	ExpiresAt   time.Time `json:"expires_at"`
}

type CredentialPrincipal struct {
	CredentialID, WorkloadID, TeamID string
	Name                             string
	Permissions                      []string
}
type TokenPrincipal struct {
	TokenID, CredentialID, WorkloadID, TeamID string
	Name                                      string
	Permissions                               []string
	ExpiresAt                                 time.Time
}
