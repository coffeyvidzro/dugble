package sesevents

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v5"

	snsintegration "github.com/coffeyvidzro/dugble/server/internal/integration/sns"
	jetstreammessaging "github.com/coffeyvidzro/dugble/server/internal/messaging/jetstream"
)

type verifierStub struct {
	message snsintegration.Message
	err     error
}

func (v verifierStub) Verify(context.Context, []byte) (snsintegration.Message, error) {
	return v.message, v.err
}

type publisherStub struct {
	calls              int
	subject, messageID string
	payload            []byte
	err                error
}

func (p *publisherStub) Publish(_ context.Context, subject string, payload []byte, _ map[string]string, messageID string) error {
	p.calls++
	p.subject, p.payload, p.messageID = subject, payload, messageID
	return p.err
}

type confirmerStub struct {
	calls int
	err   error
}

func (c *confirmerStub) Confirm(context.Context, string) error { c.calls++; return c.err }

func TestReceivePublishesVerifiedNotification(t *testing.T) {
	message := snsintegration.Message{Type: "Notification", MessageID: "sns-id", TopicARN: "arn:aws:sns:us-east-1:123:events", Message: `{"eventType":"Delivery"}`}
	publisher := &publisherStub{}
	handler := NewHandler(verifierStub{message: message}, publisher, nil)
	response := invoke(t, handler, `{}`)
	if response.Code != http.StatusNoContent {
		t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
	}
	if publisher.calls != 1 || publisher.subject != jetstreammessaging.SESProviderEventSubject || publisher.messageID == "" {
		t.Fatalf("unexpected publish: %#v", publisher)
	}
	var event Event
	if err := json.Unmarshal(publisher.payload, &event); err != nil {
		t.Fatal(err)
	}
	if event.ProviderNotificationID != "sns-id" || event.SchemaVersion != 1 {
		t.Fatalf("unexpected event: %#v", event)
	}
}

func TestReceiveReturnsUnavailableWhenPublishFails(t *testing.T) {
	message := snsintegration.Message{Type: "Notification", MessageID: "sns-id", TopicARN: "topic", Message: `{}`}
	response := invoke(t, NewHandler(verifierStub{message: message}, &publisherStub{err: errors.New("NATS unavailable")}, nil), `{}`)
	if response.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d", response.Code)
	}
}

func TestReceiveConfirmsVerifiedSubscription(t *testing.T) {
	confirmer := &confirmerStub{}
	message := snsintegration.Message{Type: "SubscriptionConfirmation", SubscribeURL: "https://sns.us-east-1.amazonaws.com/?Token=x"}
	response := invoke(t, NewHandler(verifierStub{message: message}, &publisherStub{}, confirmer), `{}`)
	if response.Code != http.StatusNoContent || confirmer.calls != 1 {
		t.Fatalf("status = %d, confirmations = %d", response.Code, confirmer.calls)
	}
}

func TestReceiveRejectsUnverifiedRequest(t *testing.T) {
	publisher := &publisherStub{}
	response := invoke(t, NewHandler(verifierStub{err: errors.New("invalid")}, publisher, nil), `{}`)
	if response.Code != http.StatusUnauthorized || publisher.calls != 0 {
		t.Fatalf("status = %d, publishes = %d", response.Code, publisher.calls)
	}
}

func invoke(t *testing.T, handler *Handler, body string) *httptest.ResponseRecorder {
	t.Helper()
	router := echo.New()
	request := httptest.NewRequest(http.MethodPost, "/internal/providers/aws/ses/events", strings.NewReader(body))
	response := httptest.NewRecorder()
	ctx := router.NewContext(request, response)
	if err := handler.Receive(ctx); err != nil {
		t.Fatal(err)
	}
	return response
}
