package sesevents

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type repositoryStoreStub struct {
	tags      []pgconn.CommandTag
	execCalls int
	row       pgx.Row
}

func (s *repositoryStoreStub) Exec(context.Context, string, ...any) (pgconn.CommandTag, error) {
	index := s.execCalls
	s.execCalls++
	if index >= len(s.tags) {
		return pgconn.NewCommandTag("UPDATE 0"), nil
	}
	return s.tags[index], nil
}

func (s *repositoryStoreStub) QueryRow(context.Context, string, ...any) pgx.Row { return s.row }

type providerEventRow struct {
	record ProviderEventRecord
	err    error
}

func (r providerEventRow) Scan(destinations ...any) error {
	if r.err != nil {
		return r.err
	}
	if len(destinations) != 13 {
		return errors.New("unexpected provider event scan shape")
	}
	*(destinations[0].(*uuid.UUID)) = r.record.ID
	*(destinations[1].(**uuid.UUID)) = r.record.EmailMessageID
	*(destinations[2].(*string)) = r.record.Provider
	*(destinations[3].(*string)) = r.record.Transport
	*(destinations[4].(*string)) = r.record.ProviderNotificationID
	*(destinations[5].(*string)) = r.record.ProviderMessageID
	*(destinations[6].(*string)) = string(r.record.EventType)
	*(destinations[7].(*time.Time)) = r.record.OccurredAt
	*(destinations[8].(*time.Time)) = r.record.ReceivedAt
	*(destinations[9].(*json.RawMessage)) = r.record.NormalizedPayload
	*(destinations[10].(*json.RawMessage)) = r.record.ProviderPayload
	*(destinations[11].(**time.Time)) = r.record.ProcessedAt
	*(destinations[12].(*time.Time)) = r.record.CreatedAt
	return nil
}

func TestRepositoryStoreCreatesProviderEvent(t *testing.T) {
	envelope, event, record := providerEventFixtures()
	store := &repositoryStoreStub{tags: []pgconn.CommandTag{pgconn.NewCommandTag("INSERT 0 1")}, row: providerEventRow{record: record}}

	got, created, err := (&Repository{db: store}).Store(context.Background(), envelope, event)
	if err != nil {
		t.Fatalf("store provider event: %v", err)
	}
	if !created || got.ID != record.ID || got.ProviderMessageID != event.ProviderMessageID {
		t.Fatalf("stored event = %#v, created = %t", got, created)
	}
	if store.execCalls != 1 {
		t.Fatalf("exec calls = %d", store.execCalls)
	}
}

func TestRepositoryStoreRelinksDuplicateProviderEvent(t *testing.T) {
	envelope, event, record := providerEventFixtures()
	store := &repositoryStoreStub{tags: []pgconn.CommandTag{pgconn.NewCommandTag("INSERT 0 0"), pgconn.NewCommandTag("UPDATE 1")}, row: providerEventRow{record: record}}

	_, created, err := (&Repository{db: store}).Store(context.Background(), envelope, event)
	if err != nil {
		t.Fatalf("store duplicate provider event: %v", err)
	}
	if created {
		t.Fatal("duplicate provider event must not be reported as created")
	}
	if store.execCalls != 2 {
		t.Fatalf("exec calls = %d, want insert and relink", store.execCalls)
	}
}

func TestRepositoryStoreValidatesEnvelope(t *testing.T) {
	store := &repositoryStoreStub{}
	_, _, err := (&Repository{db: store}).Store(context.Background(), Event{}, ProviderEvent{})
	if err == nil {
		t.Fatal("expected invalid event to be rejected")
	}
	if store.execCalls != 0 {
		t.Fatalf("exec calls = %d", store.execCalls)
	}
}

func TestRepositoryMarkProcessedRequiresExistingEvent(t *testing.T) {
	store := &repositoryStoreStub{tags: []pgconn.CommandTag{pgconn.NewCommandTag("UPDATE 0")}}
	err := (&Repository{db: store}).MarkProcessed(context.Background(), uuid.New(), time.Now())
	if !errors.Is(err, ErrProviderEventNotFound) {
		t.Fatalf("error = %v, want ErrProviderEventNotFound", err)
	}
}

func providerEventFixtures() (Event, ProviderEvent, ProviderEventRecord) {
	now := time.Date(2026, 7, 29, 12, 0, 0, 0, time.UTC)
	eventID := uuid.New()
	emailID := uuid.New()
	envelope := Event{EventID: eventID, SchemaVersion: 1, Provider: "aws_ses", Transport: "aws_sns", TopicARN: "arn:aws:sns:us-east-1:123:events", ProviderNotificationID: "sns-1", ReceivedAt: now, Payload: json.RawMessage(`{"eventType":"Delivery"}`)}
	event := ProviderEvent{Type: EventTypeDelivery, ProviderMessageID: "ses-1", OccurredAt: now, Recipients: []Recipient{{Email: "ada@example.com"}}, Delivery: &DeliveryDetails{SMTPResponse: "250 accepted"}}
	record := ProviderEventRecord{ID: eventID, EmailMessageID: &emailID, Provider: envelope.Provider, Transport: envelope.Transport, ProviderNotificationID: envelope.ProviderNotificationID, ProviderMessageID: event.ProviderMessageID, EventType: event.Type, OccurredAt: now, ReceivedAt: now, NormalizedPayload: json.RawMessage(`{}`), ProviderPayload: envelope.Payload, CreatedAt: now}
	return envelope, event, record
}
