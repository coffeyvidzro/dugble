package sms_test

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	sms "github.com/coffeyvidzro/dugble/server/internal/modules/sms"
	webhookmodule "github.com/coffeyvidzro/dugble/server/internal/modules/webhooks"
	platformwebhook "github.com/coffeyvidzro/dugble/server/internal/platform/webhook"
)

type failingWebhookEmitter struct{}

func (failingWebhookEmitter) EmitTx(context.Context, pgx.Tx, platformwebhook.Event) (uuid.UUID, int64, error) {
	return uuid.Nil, 0, errors.New("webhook persistence unavailable")
}

func TestSMSLifecycleUpdateCreatesWebhookEventAndDeliveryAtomically(t *testing.T) {
	pool := openSMSTestDatabase(t)
	teamID, service := setupSMSBatchTest(t, pool, 100_000)
	messages, err := service.BatchSend(smsBatchTestContext(teamID), smsBatchTestRequest())
	if err != nil {
		t.Fatalf("send SMS batch: %v", err)
	}
	messageID := uuid.MustParse(messages[0].ID)

	endpointID := uuid.New()
	if _, err := pool.Exec(t.Context(), `
		INSERT INTO webhook_endpoints (id, team_id, url, signing_secret, subscribed_events)
		VALUES ($1, $2, 'https://example.com/webhooks', 'test-secret', ARRAY[$3]::text[])
	`, endpointID, teamID, platformwebhook.EventSMSFailed); err != nil {
		t.Fatalf("create webhook endpoint: %v", err)
	}

	webhookRepository := webhookmodule.NewRepository(pool)
	repository := sms.NewRepositoryWithWebhookEmitter(pool, platformwebhook.NewEmitter(webhookRepository))
	updated, err := repository.MarkFailed(t.Context(), messageID, teamID, "provider rejected message")
	if err != nil {
		t.Fatalf("mark SMS failed: %v", err)
	}
	if updated.Status != sms.StatusFailed {
		t.Fatalf("SMS status = %q, want failed", updated.Status)
	}

	var eventType, objectType, deliveryStatus string
	var objectID uuid.UUID
	if err := pool.QueryRow(t.Context(), `
		SELECT event.event_type, event.object_type, event.object_id, delivery.status
		FROM webhook_events AS event
		JOIN webhook_deliveries AS delivery ON delivery.event_id = event.id
		WHERE event.team_id = $1 AND event.object_id = $2 AND delivery.endpoint_id = $3
	`, teamID, messageID, endpointID).Scan(&eventType, &objectType, &objectID, &deliveryStatus); err != nil {
		t.Fatalf("get SMS webhook event and delivery: %v", err)
	}
	if eventType != platformwebhook.EventSMSFailed || objectType != "sms" || objectID != messageID || deliveryStatus != "pending" {
		t.Fatalf("webhook event = type:%q object:%q/%s delivery:%q", eventType, objectType, objectID, deliveryStatus)
	}

	rollbackMessageID := uuid.MustParse(messages[1].ID)
	failingRepository := sms.NewRepositoryWithWebhookEmitter(pool, failingWebhookEmitter{})
	if _, err := failingRepository.MarkFailed(t.Context(), rollbackMessageID, teamID, "provider rejected message"); err == nil {
		t.Fatal("MarkFailed() succeeded when webhook persistence failed")
	}
	var rolledBackStatus string
	if err := pool.QueryRow(t.Context(), `SELECT status FROM sms_messages WHERE id = $1`, rollbackMessageID).Scan(&rolledBackStatus); err != nil {
		t.Fatalf("get rolled-back SMS status: %v", err)
	}
	if rolledBackStatus != sms.StatusQueued {
		t.Fatalf("rolled-back SMS status = %q, want queued", rolledBackStatus)
	}
}
