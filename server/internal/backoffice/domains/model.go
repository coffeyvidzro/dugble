package domains

import "time"

type Filter struct {
	Query  string
	Status string
}

type Row struct {
	ID        string
	TeamName  string
	Domain    string
	Provider  string
	Status    string
	CreatedAt time.Time
}

type StatusRequest struct {
	Action string
	Reason string
}
