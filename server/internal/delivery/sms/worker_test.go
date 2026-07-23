package smsdelivery

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/riverqueue/river"

	smsapi "github.com/coffeyvidzro/dugble/server/internal/integration/sms"
	smsmodule "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
	"github.com/coffeyvidzro/dugble/server/internal/modules/wallet"
)

func TestWorkerSafeProviderRejectionRefundsAndMarksFailed(t *testing.T) {
	messageID := uuid.New()
	teamID := uuid.New()
	repo := newFakeRepository(messageID, teamID, smsmodule.StatusQueued)
	senderErr := &smsapi.SendError{Attempts: []smsapi.ProviderAttempt{{ProviderID: "test", Err: safeSendError{}}}}
	worker := newTestWorker(repo, &fakeSender{sendErr: senderErr}, &fakeWallet{})

	if err := worker.Work(context.Background(), testJob(messageID, teamID)); err != nil {
		t.Fatalf("Work returned error: %v", err)
	}
	if repo.message.Status != smsmodule.StatusFailed {
		t.Fatalf("status = %q, want %q", repo.message.Status, smsmodule.StatusFailed)
	}
	if repo.refundPendingCalls != 1 {
		t.Fatalf("refundPendingCalls = %d, want 1", repo.refundPendingCalls)
	}
	if worker.wallet.(*fakeWallet).refundCalls != 1 {
		t.Fatalf("refundCalls = %d, want 1", worker.wallet.(*fakeWallet).refundCalls)
	}
}

func TestWorkerAmbiguousProviderErrorStaysProcessingAndRetries(t *testing.T) {
	messageID := uuid.New()
	teamID := uuid.New()
	repo := newFakeRepository(messageID, teamID, smsmodule.StatusQueued)
	worker := newTestWorker(repo, &fakeSender{sendErr: errors.New("connection reset")}, &fakeWallet{})

	if err := worker.Work(context.Background(), testJob(messageID, teamID)); err == nil {
		t.Fatal("Work returned nil error for ambiguous provider failure")
	}
	if repo.message.Status != smsmodule.StatusProcessing {
		t.Fatalf("status = %q, want %q", repo.message.Status, smsmodule.StatusProcessing)
	}
	if repo.refundPendingCalls != 0 {
		t.Fatalf("refundPendingCalls = %d, want 0", repo.refundPendingCalls)
	}
	if worker.wallet.(*fakeWallet).refundCalls != 0 {
		t.Fatalf("refundCalls = %d, want 0", worker.wallet.(*fakeWallet).refundCalls)
	}
}

func TestWorkerRefundPendingRetryDoesNotResend(t *testing.T) {
	messageID := uuid.New()
	teamID := uuid.New()
	repo := newFakeRepository(messageID, teamID, smsmodule.StatusRefundPending)
	reason := "provider rejected recipient"
	repo.message.ErrorMessage = &reason
	sender := &fakeSender{}
	worker := newTestWorker(repo, sender, &fakeWallet{})

	if err := worker.Work(context.Background(), testJob(messageID, teamID)); err != nil {
		t.Fatalf("Work returned error: %v", err)
	}
	if sender.sendCalls != 0 {
		t.Fatalf("sendCalls = %d, want 0", sender.sendCalls)
	}
	if repo.message.Status != smsmodule.StatusFailed {
		t.Fatalf("status = %q, want %q", repo.message.Status, smsmodule.StatusFailed)
	}
}

func TestWorkerProcessingRetryDoesNotResendBeforeStale(t *testing.T) {
	messageID := uuid.New()
	teamID := uuid.New()
	repo := newFakeRepository(messageID, teamID, smsmodule.StatusProcessing)
	repo.message.UpdatedAt = time.Now()
	sender := &fakeSender{}
	worker := newTestWorker(repo, sender, &fakeWallet{})
	worker.staleProcessingAfter = time.Hour

	if err := worker.Work(context.Background(), testJob(messageID, teamID)); err == nil {
		t.Fatal("Work returned nil error for active processing message")
	}
	if sender.sendCalls != 0 {
		t.Fatalf("sendCalls = %d, want 0", sender.sendCalls)
	}
	if repo.message.Status != smsmodule.StatusProcessing {
		t.Fatalf("status = %q, want %q", repo.message.Status, smsmodule.StatusProcessing)
	}
}

func TestWorkerStaleProcessingRefundsWithoutResend(t *testing.T) {
	messageID := uuid.New()
	teamID := uuid.New()
	repo := newFakeRepository(messageID, teamID, smsmodule.StatusProcessing)
	repo.message.UpdatedAt = time.Now().Add(-2 * time.Hour)
	sender := &fakeSender{}
	worker := newTestWorker(repo, sender, &fakeWallet{})
	worker.staleProcessingAfter = time.Hour

	if err := worker.Work(context.Background(), testJob(messageID, teamID)); err != nil {
		t.Fatalf("Work returned error: %v", err)
	}
	if sender.sendCalls != 0 {
		t.Fatalf("sendCalls = %d, want 0", sender.sendCalls)
	}
	if repo.message.Status != smsmodule.StatusFailed {
		t.Fatalf("status = %q, want %q", repo.message.Status, smsmodule.StatusFailed)
	}
}

func newTestWorker(repo *fakeRepository, sender *fakeSender, wallet *fakeWallet) *Worker {
	return &Worker{repository: repo, sender: sender, wallet: wallet, staleProcessingAfter: defaultStaleProcessingAfter}
}

func testJob(messageID uuid.UUID, teamID uuid.UUID) *river.Job[DeliverArgs] {
	return &river.Job[DeliverArgs]{Args: DeliverArgs{MessageID: messageID, TeamID: teamID}}
}

type fakeRepository struct {
	message            smsmodule.Message
	refundPendingCalls int
}

func newFakeRepository(messageID uuid.UUID, teamID uuid.UUID, status string) *fakeRepository {
	return &fakeRepository{message: smsmodule.Message{
		ID:         messageID.String(),
		TeamID:     teamID.String(),
		To:         "+233241234567",
		From:       "DUGBLE",
		Body:       "hello",
		Status:     status,
		CostMicros: 9_000,
		Metadata:   json.RawMessage(`{}`),
		UpdatedAt:  time.Now(),
	}}
}

func (r *fakeRepository) MarkProcessing(_ context.Context, id uuid.UUID, teamID uuid.UUID) (smsmodule.Message, error) {
	if r.message.ID != id.String() || r.message.TeamID != teamID.String() || r.message.Status != smsmodule.StatusQueued {
		return smsmodule.Message{}, smsmodule.ErrMessageNotFound
	}
	r.message.Status = smsmodule.StatusProcessing
	r.message.UpdatedAt = time.Now()
	return r.message, nil
}

func (r *fakeRepository) Get(_ context.Context, id uuid.UUID, teamID uuid.UUID) (smsmodule.Message, error) {
	if r.message.ID != id.String() || r.message.TeamID != teamID.String() {
		return smsmodule.Message{}, smsmodule.ErrMessageNotFound
	}
	return r.message, nil
}

func (r *fakeRepository) MarkRefundPending(_ context.Context, id uuid.UUID, teamID uuid.UUID, message string) (smsmodule.Message, error) {
	if r.message.ID != id.String() || r.message.TeamID != teamID.String() {
		return smsmodule.Message{}, smsmodule.ErrMessageNotFound
	}
	r.refundPendingCalls++
	r.message.Status = smsmodule.StatusRefundPending
	r.message.ErrorMessage = &message
	r.message.UpdatedAt = time.Now()
	return r.message, nil
}

func (r *fakeRepository) MarkFailed(_ context.Context, id uuid.UUID, teamID uuid.UUID, message string) (smsmodule.Message, error) {
	if r.message.ID != id.String() || r.message.TeamID != teamID.String() {
		return smsmodule.Message{}, smsmodule.ErrMessageNotFound
	}
	r.message.Status = smsmodule.StatusFailed
	r.message.ErrorMessage = &message
	r.message.UpdatedAt = time.Now()
	return r.message, nil
}

func (r *fakeRepository) MarkSubmitted(_ context.Context, id uuid.UUID, teamID uuid.UUID, providerID string, providerMessageID string, status string) (smsmodule.Message, error) {
	if r.message.ID != id.String() || r.message.TeamID != teamID.String() {
		return smsmodule.Message{}, smsmodule.ErrMessageNotFound
	}
	r.message.Status = status
	r.message.ProviderID = &providerID
	r.message.ProviderMessageID = &providerMessageID
	r.message.UpdatedAt = time.Now()
	return r.message, nil
}

type fakeSender struct {
	sendCalls int
	sendErr   error
}

func (s *fakeSender) Send(context.Context, smsapi.SendRequest) (*smsapi.SendResponse, error) {
	s.sendCalls++
	if s.sendErr != nil {
		return nil, s.sendErr
	}
	return &smsapi.SendResponse{ProviderID: "test", ProviderMsgID: "provider-123", Status: smsapi.StatusSubmitted}, nil
}

func (s *fakeSender) CheckStatus(context.Context, string, string) (*smsapi.StatusResponse, error) {
	return nil, errors.New("not implemented")
}

type fakeWallet struct{ refundCalls int }

func (w *fakeWallet) RefundSMSCharge(context.Context, uuid.UUID, int64, uuid.UUID, json.RawMessage) (wallet.Transaction, error) {
	w.refundCalls++
	return wallet.Transaction{}, nil
}

type safeSendError struct{}

func (safeSendError) Error() string        { return "safe provider rejection" }
func (safeSendError) SafeToFallback() bool { return true }
