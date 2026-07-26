package email

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type configuredDeliveryQueue struct{}

func (configuredDeliveryQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error {
	return nil
}

type immediateOnlyDeliveryQueue struct{ calls int }

func (q *immediateOnlyDeliveryQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error {
	q.calls++
	return nil
}

func TestEnqueueDeliveryDoesNotSilentlyIgnoreSchedule(t *testing.T) {
	queue := &immediateOnlyDeliveryQueue{}
	scheduledAt := time.Now().UTC().Add(time.Hour)
	err := enqueueDelivery(context.Background(), queue, nil, uuid.New(), uuid.New(), &scheduledAt)
	if err == nil {
		t.Fatal("expected a queue without scheduling support to return an error")
	}
	if queue.calls != 0 {
		t.Fatalf("immediate enqueue calls = %d, want 0", queue.calls)
	}
}

func TestBatchSendValidatesEntireBatchBeforeStartingTransaction(t *testing.T) {
	service := NewService(nil, configuredDeliveryQueue{}, ServiceConfig{DefaultFromEmail: "sender@example.com"})
	ctx := tenant.ContextWithTenant(context.Background(), tenant.Context{
		TeamID:      uuid.New(),
		Permissions: []tenant.Permission{tenant.PermissionEmailSend},
	})

	_, err := service.BatchSend(ctx, BatchSendRequest{Messages: []SendRequest{
		{To: EmailAddressList{{Email: "first@example.com"}}, Subject: "First", Text: "valid"},
		{To: EmailAddressList{{Email: "not-an-email"}}, Subject: "Second", Text: "invalid"},
	}})
	if err == nil {
		t.Fatal("expected the invalid second message to reject the batch")
	}
}

func TestBatchSendRejectsMoreThanOneHundredEmails(t *testing.T) {
	service := NewService(nil, configuredDeliveryQueue{}, ServiceConfig{DefaultFromEmail: "sender@example.com"})
	messages := make([]SendRequest, 101)
	_, err := service.BatchSend(context.Background(), BatchSendRequest{Messages: messages})
	if err == nil {
		t.Fatal("expected oversized batch to be rejected")
	}
}

func TestBatchSendRejectsAttachmentsBeforeStartingTransaction(t *testing.T) {
	service := NewService(nil, configuredDeliveryQueue{}, ServiceConfig{DefaultFromEmail: "sender@example.com"})
	ctx := tenant.ContextWithTenant(context.Background(), tenant.Context{
		TeamID: uuid.New(), Permissions: []tenant.Permission{tenant.PermissionEmailSend},
	})
	_, err := service.BatchSend(ctx, BatchSendRequest{Messages: []SendRequest{{
		To: EmailAddressList{{Email: "recipient@example.com"}}, Subject: "Attachment", Text: "body",
		Attachments: []Attachment{{Filename: "file.txt", Content: "ZmlsZQ=="}},
	}}})
	if err == nil {
		t.Fatal("expected batch attachment to be rejected")
	}
}
