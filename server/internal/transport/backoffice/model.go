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

type TeamFilter struct {
	Query string
}

type SMSFilter struct {
	Query  string
	Status string
}

type WalletFilter struct {
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

type WalletRow struct {
	ID        string
	TeamName  string
	Currency  string
	Balance   int64
	Status    string
	UpdatedAt time.Time
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
}
