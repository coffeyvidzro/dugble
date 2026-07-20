package session

import (
	"time"

	"github.com/google/uuid"
)

type Record struct {
	ID         string
	UserID     uuid.UUID
	TokenHash  string
	UserAgent  *string
	IPAddress  *string
	ExpiresAt  time.Time
	RevokedAt  *time.Time
	CreatedAt  time.Time
	LastSeenAt time.Time
}

type Session struct {
	ID         string     `json:"id"`
	UserAgent  *string    `json:"user_agent,omitempty"`
	IPAddress  *string    `json:"ip_address,omitempty"`
	ExpiresAt  time.Time  `json:"expires_at"`
	RevokedAt  *time.Time `json:"revoked_at,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
	LastSeenAt time.Time  `json:"last_seen_at"`
}
