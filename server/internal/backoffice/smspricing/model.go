package smspricing

import "time"

type PlanRow struct {
	ID                   string
	Name                 string
	Currency             string
	IsDefault            bool
	Status               string
	LocalRateMicros      int64
	HasCurrentLocalRate  bool
	A2PRateMicros        int64
	HasCurrentA2PRate    bool
	CreatedAt            time.Time
	UpdatedAt            time.Time
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
	CreatedAt      time.Time
}

type PlanDetail struct {
	Plan  PlanRow
	Rates []RateRow
}

type CreatePlanRequest struct {
	Name        string
	MakeDefault bool
}

type AddRateRequest struct {
	TrafficClass  string
	UnitCostUSD   string
	EffectiveFrom string
	EffectiveUntil string
}

type TeamConfiguration struct {
	TeamID              string
	PricingPlanID        string
	PricingPlanName      string
	DefaultTrafficClass  string
	LocalEnabled         bool
	A2PEnabled           bool
	Explicit             bool
	UpdatedAt            *time.Time
}

type UpdateTeamRequest struct {
	PricingPlanID       string
	DefaultTrafficClass string
	LocalEnabled        bool
	A2PEnabled          bool
}
