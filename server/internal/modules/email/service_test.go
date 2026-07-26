package email

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
)

type fakeTx struct {
	commitCalls   int
	rollbackCalls int
	commitErr     error
}

func (tx *fakeTx) Begin(context.Context) (pgx.Tx, error) { return tx, nil }
func (tx *fakeTx) Commit(context.Context) error {
	tx.commitCalls++
	return tx.commitErr
}
func (tx *fakeTx) Rollback(context.Context) error {
	tx.rollbackCalls++
	return nil
}
func (tx *fakeTx) CopyFrom(context.Context, pgx.Identifier, []string, pgx.CopyFromSource) (int64, error) {
	return 0, nil
}
func (tx *fakeTx) SendBatch(context.Context, *pgx.Batch) pgx.BatchResults { return nil }
func (tx *fakeTx) LargeObjects() pgx.LargeObjects                         { return pgx.LargeObjects{} }
func (tx *fakeTx) Prepare(context.Context, string, string) (*pgconn.StatementDescription, error) {
	return nil, nil
}
func (tx *fakeTx) Exec(context.Context, string, ...any) (pgconn.CommandTag, error) {
	return pgconn.CommandTag{}, nil
}
func (tx *fakeTx) Query(context.Context, string, ...any) (pgx.Rows, error) { return nil, nil }
func (tx *fakeTx) QueryRow(context.Context, string, ...any) pgx.Row        { return nil }
func (tx *fakeTx) Conn() *pgx.Conn                                        { return nil }

type fakeEmailRepository struct {
	tx          *fakeTx
	beginCalls  int
	createCalls int
	createErrAt int
	messages    []Message
}

func (r *fakeEmailRepository) BeginTx(context.Context) (pgx.Tx, error) {
	r.beginCalls++
	if r.tx == nil {
		r.tx = &fakeTx{}
	}
	return r.tx, nil
}
func (r *fakeEmailRepository) CreateTx(context.Context, pgx.Tx, uuid.UUID, validatedSend) (Message, error) {
	r.createCalls++
	if r.createErrAt > 0 && r.createCalls == r.createErrAt {
		return Message{}, errors.New("create failed")
	}
	if len(r.messages) >= r.createCalls {
		return r.messages[r.createCalls-1], nil
	}
	return Message{ID: uuid.NewString(), Status: StatusQueued, QueuedAt: time.Now().UTC()}, nil
}
func (*fakeEmailRepository) Get(context.Context, uuid.UUID, uuid.UUID) (Message, error) {
	return Message{}, ErrNotFound
}
func (*fakeEmailRepository) List(context.Context, uuid.UUID, int32, int32) ([]MessageSummary, error) {
	return nil, nil
}

type recordingDeliveryQueue struct {
	calls int
	errAt int
}

func (q *recordingDeliveryQueue) EnqueueEmailDeliveryTx(context.Context, pgx.Tx, uuid.UUID, uuid.UUID) error {
	q.calls++
	if q.errAt > 0 && q.calls == q.errAt {
		return errors.New("enqueue failed")
	}
	return nil
}

func emailSendContext() context.Context {
	return tenant.ContextWithTenant(context.Background(), tenant.Context{
		TeamID:      uuid.New(),
		Permissions: []tenant.Permission{tenant.PermissionEmailSend},
	})
}

func validSendRequest(recipient string) SendRequest {
	return SendRequest{To: EmailAddress{Email: recipient}, Subject: "Subject", Text: "Body"}
}

func TestBatchSendValidatesEntireBatchBeforeStartingTransaction(t *testing.T) {
	repository := &fakeEmailRepository{}
	service := NewService(repository, &recordingDeliveryQueue{}, ServiceConfig{DefaultFromEmail: "sender@example.com"})

	_, err := service.BatchSend(emailSendContext(), BatchSendRequest{Messages: []SendRequest{
		validSendRequest("first@example.com"),
		validSendRequest("not-an-email"),
	}})
	if err == nil {
		t.Fatal("expected the invalid second message to reject the batch")
	}
	if repository.beginCalls != 0 {
		t.Fatalf("begin calls = %d, want 0", repository.beginCalls)
	}
}

func TestBatchSendRejectsOversizedAggregateBeforeStartingTransaction(t *testing.T) {
	repository := &fakeEmailRepository{}
	service := NewService(repository, &recordingDeliveryQueue{}, ServiceConfig{DefaultFromEmail: "sender@example.com"})
	messages := make([]SendRequest, 6)
	for index := range messages {
		messages[index] = SendRequest{
			To:      EmailAddress{Email: uuid.NewString() + "@example.com"},
			Subject: "Subject",
			Text:    strings.Repeat("a", maxBodyBytes),
		}
	}

	_, err := service.BatchSend(emailSendContext(), BatchSendRequest{Messages: messages})
	if err == nil {
		t.Fatal("expected oversized aggregate payload to be rejected")
	}
	if repository.beginCalls != 0 {
		t.Fatalf("begin calls = %d, want 0", repository.beginCalls)
	}
}

func TestSendRollsBackWhenOutboxEnqueueFails(t *testing.T) {
	tx := &fakeTx{}
	repository := &fakeEmailRepository{tx: tx}
	delivery := &recordingDeliveryQueue{errAt: 1}
	service := NewService(repository, delivery, ServiceConfig{DefaultFromEmail: "sender@example.com"})

	_, err := service.Send(emailSendContext(), validSendRequest("recipient@example.com"))
	if err == nil {
		t.Fatal("expected enqueue failure")
	}
	if tx.commitCalls != 0 {
		t.Fatalf("commit calls = %d, want 0", tx.commitCalls)
	}
	if tx.rollbackCalls != 1 {
		t.Fatalf("rollback calls = %d, want 1", tx.rollbackCalls)
	}
}

func TestSendCommitsAfterMessageAndOutboxSucceed(t *testing.T) {
	tx := &fakeTx{}
	repository := &fakeEmailRepository{tx: tx}
	delivery := &recordingDeliveryQueue{}
	service := NewService(repository, delivery, ServiceConfig{DefaultFromEmail: "sender@example.com"})

	message, err := service.Send(emailSendContext(), validSendRequest("recipient@example.com"))
	if err != nil {
		t.Fatalf("Send returned error: %v", err)
	}
	if message.Status != StatusQueued {
		t.Fatalf("status = %q, want %q", message.Status, StatusQueued)
	}
	if repository.createCalls != 1 || delivery.calls != 1 {
		t.Fatalf("create calls = %d, delivery calls = %d, want 1 each", repository.createCalls, delivery.calls)
	}
	if tx.commitCalls != 1 {
		t.Fatalf("commit calls = %d, want 1", tx.commitCalls)
	}
}

func TestBatchSendRollsBackAllMessagesWhenLaterEnqueueFails(t *testing.T) {
	tx := &fakeTx{}
	repository := &fakeEmailRepository{tx: tx}
	delivery := &recordingDeliveryQueue{errAt: 2}
	service := NewService(repository, delivery, ServiceConfig{DefaultFromEmail: "sender@example.com"})

	_, err := service.BatchSend(emailSendContext(), BatchSendRequest{Messages: []SendRequest{
		validSendRequest("first@example.com"),
		validSendRequest("second@example.com"),
	}})
	if err == nil {
		t.Fatal("expected second enqueue to fail")
	}
	if repository.createCalls != 2 || delivery.calls != 2 {
		t.Fatalf("create calls = %d, delivery calls = %d, want 2 each", repository.createCalls, delivery.calls)
	}
	if tx.commitCalls != 0 {
		t.Fatalf("commit calls = %d, want 0", tx.commitCalls)
	}
	if tx.rollbackCalls != 1 {
		t.Fatalf("rollback calls = %d, want 1", tx.rollbackCalls)
	}
}
