package sesevents

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

type repositoryQueriesStub struct {
	createCount int64
	linkCount   int64
	processed   int64
	createCalls int
	linkCalls   int
	row         dbsqlc.EmailProviderEvent
}

func (s *repositoryQueriesStub) CreateEmailProviderEvent(context.Context, dbsqlc.CreateEmailProviderEventParams) (int64, error) {
	s.createCalls++
	return s.createCount, nil
}
func (s *repositoryQueriesStub) LinkEmailProviderEvent(context.Context, dbsqlc.LinkEmailProviderEventParams) (int64, error) {
	s.linkCalls++
	return s.linkCount, nil
}
func (s *repositoryQueriesStub) GetEmailProviderEventByNotification(context.Context, dbsqlc.GetEmailProviderEventByNotificationParams) (dbsqlc.EmailProviderEvent, error) {
	return s.row, nil
}
func (s *repositoryQueriesStub) MarkEmailProviderEventProcessed(context.Context, dbsqlc.MarkEmailProviderEventProcessedParams) (int64, error) {
	return s.processed, nil
}

func TestRepositoryStoreCreatesProviderEvent(t *testing.T) {
	envelope, event, row := providerEventFixtures()
	queries := &repositoryQueriesStub{createCount: 1, row: row}

	got, created, err := (&Repository{queries: queries}).Store(context.Background(), envelope, event)
	if err != nil {
		t.Fatalf("store provider event: %v", err)
	}
	if !created || got.ID != row.ID || got.ProviderMessageID != event.ProviderMessageID {
		t.Fatalf("stored event = %#v, created = %t", got, created)
	}
	if queries.createCalls != 1 || queries.linkCalls != 0 {
		t.Fatalf("create calls = %d, link calls = %d", queries.createCalls, queries.linkCalls)
	}
}

func TestRepositoryStoreRelinksDuplicateProviderEvent(t *testing.T) {
	envelope, event, row := providerEventFixtures()
	queries := &repositoryQueriesStub{createCount: 0, linkCount: 1, row: row}

	_, created, err := (&Repository{queries: queries}).Store(context.Background(), envelope, event)
	if err != nil {
		t.Fatalf("store duplicate provider event: %v", err)
	}
	if created {
		t.Fatal("duplicate provider event must not be reported as created")
	}
	if queries.createCalls != 1 || queries.linkCalls != 1 {
		t.Fatalf("create calls = %d, link calls = %d", queries.createCalls, queries.linkCalls)
	}
}

func TestRepositoryStoreValidatesEnvelope(t *testing.T) {
	queries := &repositoryQueriesStub{}
	_, _, err := (&Repository{queries: queries}).Store(context.Background(), Event{}, ProviderEvent{})
	if err == nil {
		t.Fatal("expected invalid event to be rejected")
	}
	if queries.createCalls != 0 {
		t.Fatalf("create calls = %d", queries.createCalls)
	}
}

func TestRepositoryMarkProcessedRequiresExistingEvent(t *testing.T) {
	queries := &repositoryQueriesStub{processed: 0}
	err := (&Repository{queries: queries}).MarkProcessed(context.Background(), uuid.New(), time.Now())
	if !errors.Is(err, ErrProviderEventNotFound) {
		t.Fatalf("error = %v, want ErrProviderEventNotFound", err)
	}
}

func providerEventFixtures() (Event, ProviderEvent, dbsqlc.EmailProviderEvent) {
	now := time.Date(2026, 7, 29, 12, 0, 0, 0, time.UTC)
	eventID := uuid.New()
	emailID := uuid.New()
	envelope := Event{EventID: eventID, SchemaVersion: 1, Provider: "aws_ses", Transport: "aws_sns", TopicARN: "arn:aws:sns:us-east-1:123:events", ProviderNotificationID: "sns-1", ReceivedAt: now, Payload: json.RawMessage(`{"eventType":"Delivery"}`)}
	event := ProviderEvent{Type: EventTypeDelivery, ProviderMessageID: "ses-1", OccurredAt: now, Recipients: []Recipient{{Email: "ada@example.com"}}, Delivery: &DeliveryDetails{SMTPResponse: "250 accepted"}}
	row := dbsqlc.EmailProviderEvent{ID: eventID, EmailMessageID: &emailID, Provider: envelope.Provider, Transport: envelope.Transport, ProviderNotificationID: envelope.ProviderNotificationID, ProviderMessageID: event.ProviderMessageID, EventType: string(event.Type), OccurredAt: pgtype.Timestamptz{Time: now, Valid: true}, ReceivedAt: pgtype.Timestamptz{Time: now, Valid: true}, NormalizedPayload: []byte(`{}`), ProviderPayload: envelope.Payload, CreatedAt: pgtype.Timestamptz{Time: now, Valid: true}}
	return envelope, event, row
}
