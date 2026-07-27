package identityverification

import "context"

// Repository defines persistence operations for identity verification records.
// Database-backed methods will be added with the identity verification schema.
type Repository interface {
	Create(context.Context, CreateRequest) (Verification, error)
	Get(context.Context, string) (Verification, error)
	UpdateStatus(context.Context, string, string) (Verification, error)
}
