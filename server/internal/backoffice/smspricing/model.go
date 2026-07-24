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
	LocalRateMicros     int64
	HasCurrentLocalRate bool
	A2PRateMicros       int64
	HasCurrentA2PRate   bool
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

type PlanOption struct {
	ID        string
	Name      string
	IsDefault bool
}

type RateRow struct {
	ID             string
	TrafficClass   string
	UnitCostMicros int64
	EffectiveFrom  time.Time
	EffectiveUntil *time.Time
	Status         string
	Lifecycle      string
	CanEdit        bool
	CanCancel      bool
	CreatedAt      time.Time
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
	LocalRates        []RateRow
	A2PRates          []RateRow
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
	TrafficClass   string
	UnitCostUSD    string
	EffectiveFrom  string
	EffectiveUntil string
}

type UpdateRateRequest struct {
	UnitCostUSD    string
	EffectiveFrom  string
	EffectiveUntil string
}

type RatePreview struct {
	PlanID            string
	PlanName          string
	TrafficClass      string
	UnitCostUSD       string
	UnitCostMicros    int64
	EffectiveFrom     time.Time
	EffectiveUntil    *time.Time
	CurrentRateMicros int64
	HasCurrentRate    bool
}

type TeamConfiguration struct {
	TeamID              string
	PricingPlanID       string
	PricingPlanName     string
	DefaultTrafficClass string
	LocalEnabled        bool
	A2PEnabled          bool
	Explicit            bool
	UpdatedAt           *time.Time
}

type UpdateTeamRequest struct {
	PricingPlanID       string
	DefaultTrafficClass string
	LocalEnabled        bool
	A2PEnabled          bool
}
