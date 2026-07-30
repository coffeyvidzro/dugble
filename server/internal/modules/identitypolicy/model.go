package identitypolicy

import "time"

type Policy struct {
	TeamID               string    `json:"team_id"`
	RequireMFA           bool      `json:"require_mfa"`
	SessionMaxAgeMinutes int32     `json:"session_max_age_minutes"`
	UpdatedBy            *string   `json:"updated_by,omitempty"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type UpdateRequest struct {
	RequireMFA           bool  `json:"require_mfa"`
	SessionMaxAgeMinutes int32 `json:"session_max_age_minutes"`
}
