package email

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type configuredDeliveryQueue struct{}

func (configuredDeliveryQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error {
	return nil
}

func TestBatchSendValidatesEntireBatchBeforeStartingTransaction(t *testing.T) {
	service := NewService(nil, configuredDeliveryQueue{}, ServiceConfig{DefaultFromEmail: "sender@example.com"})
	ctx := tenant.ContextWithTenant(context.Background(), tenant.Context{
		TeamID:      uuid.New(),
		Permissions: []tenant.Permission{tenant.PermissionEmailSend},
	})

	_, err := service.BatchSend(ctx, BatchSendRequest{Messages: []SendRequest{
		{To: EmailAddress{Email: "first@example.com"}, Subject: "First", Text: "valid"},
		{To: EmailAddress{Email: "not-an-email"}, Subject: "Second", Text: "invalid"},
	}})
	if err == nil {
		t.Fatal("expected the invalid second message to reject the batch")
	}
}
