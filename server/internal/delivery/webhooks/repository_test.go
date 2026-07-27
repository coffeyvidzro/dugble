package webhookdelivery

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

type fakeDeliveryQueries struct {
	claim       func(context.Context, dbsqlc.ClaimWebhookDeliveriesParams) ([]dbsqlc.ClaimWebhookDeliveriesRow, error)
	markSuccess func(context.Context, dbsqlc.MarkWebhookDeliverySucceededParams) (dbsqlc.WebhookDelivery, error)
	release     func(context.Context, dbsqlc.ReleaseWebhookDeliveryClaimParams) (int64, error)
}

func (f *fakeDeliveryQueries) ClaimWebhookDeliveries(ctx context.Context, params dbsqlc.ClaimWebhookDeliveriesParams) ([]dbsqlc.ClaimWebhookDeliveriesRow, error) {
	return f.claim(ctx, params)
}

func (f *fakeDeliveryQueries) MarkWebhookDeliverySucceeded(ctx context.Context, params dbsqlc.MarkWebhookDeliverySucceededParams) (dbsqlc.WebhookDelivery, error) {
	return f.markSuccess(ctx, params)
}

func (f *fakeDeliveryQueries) ScheduleWebhookDeliveryRetry(context.Context, dbsqlc.ScheduleWebhookDeliveryRetryParams) (dbsqlc.WebhookDelivery, error) {
	panic("unexpected ScheduleWebhookDeliveryRetry call")
}

func (f *fakeDeliveryQueries) MarkWebhookDeliveryFailed(context.Context, dbsqlc.MarkWebhookDeliveryFailedParams) (dbsqlc.WebhookDelivery, error) {
	panic("unexpected MarkWebhookDeliveryFailed call")
}

func (f *fakeDeliveryQueries) ReleaseWebhookDeliveryClaim(ctx context.Context, params dbsqlc.ReleaseWebhookDeliveryClaimParams) (int64, error) {
	return f.release(ctx, params)
}

func TestRepositoryClaimMapsDeliveryAndWorkerID(t *testing.T) {
	deliveryID := uuid.New()
	eventID := uuid.New()
	endpointID := uuid.New()
	teamID := uuid.New()
	occurredAt := time.Date(2026, time.July, 27, 12, 0, 0, 0, time.UTC)
	staleBefore := occurredAt.Add(-time.Minute)
	queries := &fakeDeliveryQueries{
		claim: func(_ context.Context, params dbsqlc.ClaimWebhookDeliveriesParams) ([]dbsqlc.ClaimWebhookDeliveriesRow, error) {
			if params.WorkerID == nil || *params.WorkerID != "worker-1" {
				t.Fatalf("ClaimWebhookDeliveries worker ID = %v, want worker-1", params.WorkerID)
			}
			if params.LimitCount != 25 || !params.StaleBefore.Valid || !params.StaleBefore.Time.Equal(staleBefore) {
				t.Fatalf("ClaimWebhookDeliveries params = %+v", params)
			}
			return []dbsqlc.ClaimWebhookDeliveriesRow{{
				ID: deliveryID, EventID: eventID, EndpointID: endpointID, AttemptCount: 2,
				TeamID: teamID, EventType: "sms.delivered", Payload: []byte(`{"id":"message-1"}`),
				OccurredAt: pgtype.Timestamptz{Time: occurredAt, Valid: true}, Url: "https://example.com/webhooks",
				SigningSecret: []byte("secret"),
			}}, nil
		},
	}
	repository := &Repository{queries: queries}

	deliveries, err := repository.Claim(context.Background(), " worker-1 ", 25, staleBefore)
	if err != nil {
		t.Fatalf("Claim() error = %v", err)
	}
	if len(deliveries) != 1 {
		t.Fatalf("Claim() returned %d deliveries, want 1", len(deliveries))
	}
	got := deliveries[0]
	if got.ID != deliveryID || got.EventID != eventID || got.EndpointID != endpointID || got.TeamID != teamID {
		t.Errorf("Claim() IDs = %+v, want delivery/event/endpoint/team IDs", got)
	}
	if got.AttemptCount != 2 || got.EventType != "sms.delivered" || !got.OccurredAt.Equal(occurredAt) {
		t.Errorf("Claim() event metadata = %+v", got)
	}
	if string(got.Payload) != `{"id":"message-1"}` || got.URL != "https://example.com/webhooks" || string(got.SigningSecret) != "secret" {
		t.Errorf("Claim() delivery data = %+v", got)
	}
}

func TestRepositoryResultReportsLostClaim(t *testing.T) {
	deliveryID := uuid.New()
	repository := &Repository{queries: &fakeDeliveryQueries{
		markSuccess: func(context.Context, dbsqlc.MarkWebhookDeliverySucceededParams) (dbsqlc.WebhookDelivery, error) {
			return dbsqlc.WebhookDelivery{}, pgx.ErrNoRows
		},
		release: func(context.Context, dbsqlc.ReleaseWebhookDeliveryClaimParams) (int64, error) {
			return 0, nil
		},
	}}

	if err := repository.MarkSucceeded(context.Background(), deliveryID, "worker-1", 200, nil); !errors.Is(err, ErrClaimLost) {
		t.Fatalf("MarkSucceeded() error = %v, want ErrClaimLost", err)
	}
	if err := repository.ReleaseClaim(context.Background(), deliveryID, "worker-1"); !errors.Is(err, ErrClaimLost) {
		t.Fatalf("ReleaseClaim() error = %v, want ErrClaimLost", err)
	}
}
