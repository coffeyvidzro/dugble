package idempotency

import "time"

const (
	StatusProcessing = "processing"
	StatusCompleted  = "completed"
)

type Record struct {
	Scope               string
	Key                 string
	Method              string
	Path                string
	RequestHash         string
	Status              string
	ResponseStatus      *int32
	ResponseBody        []byte
	ResponseContentType *string
	ResponseHeaders     []byte
	LockedUntil         time.Time
	CompletedAt         *time.Time
	ExpiresAt           time.Time
	CreatedAt           time.Time
	UpdatedAt           time.Time
}
