package authnz

import "github.com/google/uuid"

type Principal struct {
	UserID        uuid.UUID
	SessionID     string
	Email         string
	Name          string
	EmailVerified bool
}
