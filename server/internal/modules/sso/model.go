package sso

import "time"

type Connection struct {
	ID             string    `json:"id"`
	TeamID         string    `json:"team_id"`
	Name           string    `json:"name"`
	IssuerURL      string    `json:"issuer_url"`
	ClientID       string    `json:"client_id"`
	AllowedDomains []string  `json:"allowed_domains"`
	Enabled        bool      `json:"enabled"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
type UpsertRequest struct {
	Name           string   `json:"name"`
	IssuerURL      string   `json:"issuer_url"`
	ClientID       string   `json:"client_id"`
	ClientSecret   string   `json:"client_secret"`
	AllowedDomains []string `json:"allowed_domains"`
	Enabled        *bool    `json:"enabled"`
}
type LoginResult struct {
	Token     string
	ExpiresAt time.Time
	UserID    string
}
