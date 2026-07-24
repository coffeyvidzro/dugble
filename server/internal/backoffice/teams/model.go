package teams

import (
	"time"

	backofficewallets "github.com/coffeyvidzro/dugble/server/internal/backoffice/wallets"
)

type Filter struct {
	Query string
}

type Row struct {
	ID        string
	Name      string
	Status    string
	CreatedAt time.Time
}

type Detail struct {
	Team    Row
	Members []MemberRow
	Wallets []backofficewallets.Row
	SMS     []SMSRow
}

type MemberRow struct {
	UserID    string
	Email     string
	Name      string
	Role      string
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

type StatusRequest struct {
	Action string
	Reason string
}
