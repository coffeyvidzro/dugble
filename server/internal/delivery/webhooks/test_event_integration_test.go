package webhookdelivery

import (
	"context"
	"crypto/hmac"
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	webhookmodule "github.com/coffeyvidzro/dugble/server/internal/modules/webhooks"
	"github.com/coffeyvidzro/dugble/server/internal/platform/tenant"
	platformwebhook "github.com/coffeyvidzro/dugble/server/internal/platform/webhook"
)

type recordedWebhookRequest struct {
	url     string
	headers http.Header
	body    []byte
}

type recordingWebhookClient struct {
	mu       sync.Mutex
	requests []recordedWebhookRequest
}

func (c *recordingWebhookClient) Post(_ context.Context, rawURL string, headers http.Header, body []byte) (HTTPResponse, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.requests = append(c.requests, recordedWebhookRequest{url: rawURL, headers: headers.Clone(), body: append([]byte(nil), body...)})
	return HTTPResponse{StatusCode: http.StatusNoContent, Header: make(http.Header)}, nil
}

func (c *recordingWebhookClient) requestForDelivery(deliveryID string) (recordedWebhookRequest, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	for _, request := range c.requests {
		if request.headers.Get("X-Dugble-Delivery-Id") == deliveryID {
			return request, true
		}
	}
	return recordedWebhookRequest{}, false
}

func TestTestEventIsDeliveredAndMarkedSucceeded(t *testing.T) {
	databaseURL := os.Getenv("TEST_DATABASE_URL")
	if databaseURL == "" {
		t.Skip("TEST_DATABASE_URL is not set; skipping PostgreSQL integration test")
	}
	pool, err := pgxpool.New(t.Context(), databaseURL)
	if err != nil {
		t.Fatalf("open PostgreSQL test database: %v", err)
	}
	if err := pool.Ping(t.Context()); err != nil {
		pool.Close()
		t.Fatalf("ping PostgreSQL test database: %v", err)
	}
	t.Cleanup(pool.Close)

	teamID := uuid.New()
	if _, err := pool.Exec(t.Context(), `INSERT INTO teams (id, name) VALUES ($1, $2)`, teamID, "webhook-integration-"+teamID.String()); err != nil {
		t.Fatalf("create test team (has the test database been migrated?): %v", err)
	}
	t.Cleanup(func() {
		_, _ = pool.Exec(context.Background(), `DELETE FROM teams WHERE id = $1`, teamID)
	})

	ctx := tenant.ContextWithTenant(t.Context(), tenant.Context{
		TeamID: teamID,
		Permissions: []tenant.Permission{
			tenant.PermissionWebhooksRead,
			tenant.PermissionWebhooksWrite,
		},
	})
	moduleRepository := webhookmodule.NewRepository(pool)
	service := webhookmodule.NewService(moduleRepository, platformwebhook.NewEmitter(moduleRepository))
	endpoint, err := service.CreateEndpoint(ctx, webhookmodule.CreateEndpointRequest{
		URL:              "https://example.com/webhooks",
		SubscribedEvents: []string{platformwebhook.EventSMSDelivered},
	})
	if err != nil {
		t.Fatalf("create webhook endpoint: %v", err)
	}
	delivery, err := service.TestEndpoint(ctx, endpoint.ID)
	if err != nil {
		t.Fatalf("create webhook test event: %v", err)
	}
	if delivery.Status != webhookmodule.DeliveryPending {
		t.Fatalf("initial delivery status = %q, want pending", delivery.Status)
	}

	const workerID = "webhook-delivery-integration-test"
	deliveryRepository := NewRepository(pool)
	client := &recordingWebhookClient{}
	handler := NewHandler(deliveryRepository, client, DefaultRetryPolicy(), workerID)
	consumer := NewConsumer(deliveryRepository, handler, ConsumerConfig{BatchSize: 100, Concurrency: 1}, workerID)
	if _, err := consumer.processBatch(t.Context()); err != nil {
		t.Fatalf("process webhook delivery batch: %v", err)
	}

	request, ok := client.requestForDelivery(delivery.ID)
	if !ok {
		t.Fatalf("no HTTP request recorded for delivery %s", delivery.ID)
	}
	assertTestEventRequest(t, request, delivery.EventID, delivery.ID, endpoint.SigningSecret)

	completed, err := service.GetDelivery(ctx, delivery.ID)
	if err != nil {
		t.Fatalf("get completed webhook delivery: %v", err)
	}
	if completed.Status != webhookmodule.DeliverySucceeded || completed.AttemptCount != 1 {
		t.Fatalf("completed delivery status = %q, attempts = %d; want succeeded, 1", completed.Status, completed.AttemptCount)
	}
	if completed.ResponseStatus == nil || *completed.ResponseStatus != http.StatusNoContent || completed.DeliveredAt == nil {
		t.Fatalf("completed delivery response status = %v, delivered at = %v", completed.ResponseStatus, completed.DeliveredAt)
	}
}

func assertTestEventRequest(t *testing.T, request recordedWebhookRequest, eventID, deliveryID, secret string) {
	t.Helper()
	if request.url != "https://example.com/webhooks" || request.headers.Get("Content-Type") != "application/json" {
		t.Fatalf("unexpected webhook destination or content type: url=%q headers=%v", request.url, request.headers)
	}
	if request.headers.Get("X-Dugble-Event") != platformwebhook.EventTest ||
		request.headers.Get("X-Dugble-Event-Id") != eventID ||
		request.headers.Get("X-Dugble-Delivery-Id") != deliveryID {
		t.Fatalf("unexpected webhook headers: %v", request.headers)
	}

	var envelope struct {
		ID         string    `json:"id"`
		Type       string    `json:"type"`
		OccurredAt time.Time `json:"occurred_at"`
		Data       struct {
			Test    bool   `json:"test"`
			Message string `json:"message"`
		} `json:"data"`
	}
	if err := json.Unmarshal(request.body, &envelope); err != nil {
		t.Fatalf("decode webhook envelope: %v", err)
	}
	if envelope.ID != eventID || envelope.Type != platformwebhook.EventTest || envelope.OccurredAt.IsZero() || !envelope.Data.Test || envelope.Data.Message == "" {
		t.Fatalf("unexpected webhook envelope: %+v", envelope)
	}

	signature := request.headers.Get(SignatureHeader)
	parts := strings.Split(signature, ",")
	if len(parts) != 2 || !strings.HasPrefix(parts[0], "t=") {
		t.Fatalf("invalid webhook signature: %q", signature)
	}
	timestamp, err := strconv.ParseInt(strings.TrimPrefix(parts[0], "t="), 10, 64)
	if err != nil {
		t.Fatalf("parse webhook signature timestamp: %v", err)
	}
	wantSignature := Sign([]byte(secret), timestamp, request.body)
	if !hmac.Equal([]byte(signature), []byte(wantSignature)) {
		t.Fatalf("webhook signature = %q, want %q", signature, wantSignature)
	}
}
