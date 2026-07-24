package backoffice

import "time"

type DashboardStats struct {
	Users            int64
	Teams            int64
	SMSToday         int64
	FailedSMS24Hours int64
	PendingSenderIDs int64
	PendingDomains   int64
}

type UserFilter struct {
	Query string
}

type SMSFilter struct {
	Query  string
	Status string
}

type UserRow struct {
	ID            string
	Email         string
	Name          string
	EmailVerified bool
	CreatedAt     time.Time
}

type SMSRow struct {
	ID           string
	TeamName     string
	ToNumber     string
	FromName     string
	Status       string
	ProviderID   string
	ErrorMessage string
	CreatedAt    time.Time
}

type PageData struct {
	Title  string
	Data   any
	Filter any
	CSRF   string
}

type UserDetail struct {
	User  UserRow
	Teams []TeamMembershipRow
}

type TeamMembershipRow struct {
	ID     string
	Name   string
	Role   string
	Status string
}

type SMSDetail struct {
	ID                string
	TeamID            string
	TeamName          string
	SenderID          string
	ToNumber          string
	FromName          string
	Body              string
	Status            string
	ProviderID        string
	ProviderMessageID string
	Segments          int32
	CostMicros        int64
	ErrorMessage      string
	Metadata          string
	SubmittedAt       string
	DeliveredAt       string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
