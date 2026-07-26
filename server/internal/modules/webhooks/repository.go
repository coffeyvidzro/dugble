package webhooks

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type repositoryStore interface {
	BeginTx(context.Context) (pgx.Tx, error)
	CreateEndpoint(context.Context, uuid.UUID, validatedEndpoint, []byte) (Endpoint, error)
	ListEndpoints(context.Context, uuid.UUID, int32, int32) ([]Endpoint, error)
	GetEndpoint(context.Context, uuid.UUID, uuid.UUID) (Endpoint, error)
	UpdateEndpoint(context.Context, uuid.UUID, uuid.UUID, validatedEndpoint) (Endpoint, error)
	DisableEndpoint(context.Context, uuid.UUID, uuid.UUID) (Endpoint, error)
	RotateSecret(context.Context, uuid.UUID, uuid.UUID, []byte) (Endpoint, error)
	ListEvents(context.Context, uuid.UUID, int32, int32) ([]Event, error)
	GetEvent(context.Context, uuid.UUID, uuid.UUID) (Event, error)
	GetDelivery(context.Context, uuid.UUID, uuid.UUID) (Delivery, error)
	RetryDelivery(context.Context, uuid.UUID, uuid.UUID) (Delivery, error)
}
