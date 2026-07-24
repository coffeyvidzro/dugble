package backoffice

import (
	"time"

	backofficewallets "github.com/coffeyvidzro/dugble/server/internal/backoffice/wallets"
)

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

type TeamFilter struct {
	Query string
}

type SMSFilter struct {
	Query  string
	Status string
}

type SenderIDFilter struct {
	Query  string
	Status string
}

type DomainFilter struct {
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

type TeamRow struct {
	ID        string
	Name      string
	Status    string
	CreatedAt time.Time
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

type SenderIDRow struct {
	ID          string
	TeamName    string
	Name        string
	CountryCode string
	Status      string
	CreatedAt   time.Time
}

type DomainRow struct {
	ID        string
	TeamName  string
	Domain    string
	Provider  string
	Status    string
	CreatedAt time.Time
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

type TeamDetail struct {
	Team    TeamRow
	Members []TeamMemberRow
	Wallets []backofficewallets.Row
	SMS     []SMSRow
}

type TeamMemberRow struct {
	UserID    string
	Email     string
	Name      string
	Role      string
	Status    string
	CreatedAt time.Time
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
