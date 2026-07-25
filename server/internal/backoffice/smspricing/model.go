package smspricing

import "time"

type Actor struct {
	UserID string
	Email  string
}

type PlanRow struct {
	ID                  string
	Name                string
	Currency            string
	IsDefault           bool
	Status              string
	CurrentCountryCount int64
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

type PlanOption struct {
	ID        string
	Name      string
	IsDefault bool
}

type RateRow struct {
	ID                 string
	DestinationCountry string
	UnitCostMicros     int64
	EffectiveFrom      time.Time
	EffectiveUntil     *time.Time
	Status             string
	Lifecycle          string
	CanEdit            bool
	CanCancel          bool
	CreatedAt          time.Time
}

type CountryRateTimeline struct {
	CountryCode string
	Rates       []RateRow
}

type AuditRow struct {
	ActorEmail   string
	Action       string
	ResourceType string
	ResourceID   string
	Metadata     string
	CreatedAt    time.Time
}

type PlanDetail struct {
	Plan              PlanRow
	Rates             []RateRow
	CountryRates      []CountryRateTimeline
	Audits            []AuditRow
	AssignedTeamCount int64
	RateCount         int64
	CanDelete         bool
}

type CreatePlanRequest struct {
	Name        string
	MakeDefault bool
}

type RenamePlanRequest struct {
	Name string
}

type AddRateRequest struct {
	DestinationCountry string
	UnitCostUSD         string
	EffectiveFrom      string
	EffectiveUntil     string
}

type UpdateRateRequest struct {
	UnitCostUSD    string
	EffectiveFrom  string
	EffectiveUntil string
}

type RatePreview struct {
	PlanID              string
	PlanName            string
	DestinationCountry  string
	UnitCostUSD         string
	UnitCostMicros      int64
	EffectiveFrom       time.Time
	EffectiveUntil      *time.Time
	CurrentRateMicros   int64
	HasCurrentRate      bool
}

type TeamConfiguration struct {
	TeamID          string
	PricingPlanID   string
	PricingPlanName string
	Explicit        bool
	UpdatedAt       *time.Time
}

type UpdateTeamRequest struct {
	PricingPlanID string
}
