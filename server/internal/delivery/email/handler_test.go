package emaildelivery

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

type recordingDeliveryRepository struct {
	message       DeliveryMessage
	claimErr      error
	submitted     platformemail.Result
	retryableErr  error
	failedCode    string
	failedErr     error
	markFailedErr error
}

func (r *recordingDeliveryRepository) Claim(context.Context, uuid.UUID, uuid.UUID) (DeliveryMessage, error) {
	return r.message, r.claimErr
}

func (r *recordingDeliveryRepository) MarkSubmitted(_ context.Context, _ uuid.UUID, _ uuid.UUID, result platformemail.Result) error {
	r.submitted = result
	return nil
}

func (r *recordingDeliveryRepository) MarkRetryable(_ context.Context, _ uuid.UUID, _ uuid.UUID, err error) error {
	r.retryableErr = err
	return nil
}

func (r *recordingDeliveryRepository) MarkFailed(_ context.Context, _ uuid.UUID, _ uuid.UUID, code string, err error) error {
	r.failedCode = code
	r.failedErr = err
	return r.markFailedErr
}

type stubSender struct {
	result platformemail.Result
	err    error
	sent   platformemail.Message
	calls  int
}

func (s *stubSender) Send(_ context.Context, message platformemail.Message) (platformemail.Result, error) {
	s.calls++
	s.sent = message
	return s.result, s.err
}

func TestHandlerSubmitsAcceptedMessage(t *testing.T) {
	repository := &recordingDeliveryRepository{message: DeliveryMessage{
		Provider:  "aws_ses",
		Region:    "eu-west-1",
		FromEmail: "sender@example.com",
		FromName:  "Sender",
		To:        []platformemail.Address{{Email: "recipient@example.com"}},
		Subject:   "Hello",
		Text:      "Body",
		Headers:   map[string]string{"X-Test": "true"},
	}}
	sender := &stubSender{result: platformemail.Result{Provider: "test", MessageID: "provider-1"}}

	err := NewHandler(repository, sender).Handle(context.Background(), DeliverCommand{MessageID: uuid.New(), TeamID: uuid.New()})
	if err != nil {
		t.Fatalf("handle email delivery: %v", err)
	}
	if repository.submitted.MessageID != "provider-1" {
		t.Fatalf("submitted result = %+v", repository.submitted)
	}
	if sender.sent.From.Email != "sender@example.com" || sender.sent.To[0].Email != "recipient@example.com" {
		t.Fatalf("unexpected sent message: %+v", sender.sent)
	}
	if sender.sent.Provider != "aws_ses" || sender.sent.Region != "eu-west-1" {
		t.Fatalf("unexpected delivery route: %+v", sender.sent)
	}
}

func TestHandlerStopsUnavailableSenderDomainBeforeProvider(t *testing.T) {
	repository := &recordingDeliveryRepository{claimErr: ErrSenderDomainUnavailable}
	sender := &stubSender{}

	err := NewHandler(repository, sender).Handle(context.Background(), DeliverCommand{MessageID: uuid.New(), TeamID: uuid.New()})
	if err != nil {
		t.Fatalf("unavailable sender domain should be handled: %v", err)
	}
	if sender.calls != 0 {
		t.Fatalf("sender calls = %d, want 0", sender.calls)
	}
}

func TestHandlerRecordsRetryableProviderFailure(t *testing.T) {
	providerErr := platformemail.NewSendError("throttling", true, errors.New("slow down"))
	repository := &recordingDeliveryRepository{message: DeliveryMessage{To: []platformemail.Address{{Email: "recipient@example.com"}}}}
	sender := &stubSender{err: providerErr}

	err := NewHandler(repository, sender).Handle(context.Background(), DeliverCommand{MessageID: uuid.New(), TeamID: uuid.New()})
	if err == nil {
		t.Fatal("expected retryable provider error")
	}
	if !errors.Is(err, providerErr) || repository.retryableErr == nil {
		t.Fatalf("retryable failure was not recorded: err=%v recorded=%v", err, repository.retryableErr)
	}
	if repository.failedCode != "" {
		t.Fatalf("retryable failure should not permanently fail message, got %q", repository.failedCode)
	}
}

func TestHandlerRecordsPermanentProviderFailure(t *testing.T) {
	providerErr := platformemail.NewSendError("message rejected", false, errors.New("bad recipient"))
	repository := &recordingDeliveryRepository{message: DeliveryMessage{To: []platformemail.Address{{Email: "recipient@example.com"}}}}
	sender := &stubSender{err: providerErr}

	err := NewHandler(repository, sender).Handle(context.Background(), DeliverCommand{MessageID: uuid.New(), TeamID: uuid.New()})
	if err != nil {
		t.Fatalf("permanent provider rejection should be handled: %v", err)
	}
	if repository.failedCode != "message_rejected" || !errors.Is(repository.failedErr, providerErr) {
		t.Fatalf("unexpected permanent failure: code=%q err=%v", repository.failedCode, repository.failedErr)
	}
}

func TestHandlerExhaustedMarksFailed(t *testing.T) {
	repository := &recordingDeliveryRepository{}
	cause := errors.New("still failing")

	err := NewHandler(repository, nil).HandleExhausted(context.Background(), DeliverCommand{MessageID: uuid.New(), TeamID: uuid.New()}, cause)
	if err != nil {
		t.Fatalf("handle exhausted: %v", err)
	}
	if repository.failedCode != "retry_exhausted" || !errors.Is(repository.failedErr, cause) {
		t.Fatalf("unexpected exhausted failure: code=%q err=%v", repository.failedCode, repository.failedErr)
	}
}
