package emaildelivery

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
)

type recordingEventStore struct {
	event outbox.Event
}

func (s *recordingEventStore) Enqueue(_ context.Context, event outbox.Event) (uuid.UUID, error) {
	s.event = event
	return event.ID, nil
}

func (s *recordingEventStore) EnqueueTx(_ context.Context, _ pgx.Tx, event outbox.Event) (uuid.UUID, error) {
	s.event = event
	return event.ID, nil
}

func TestQueueCreatesDeterministicEmailCommand(t *testing.T) {
	store := &recordingEventStore{}
	queue := NewQueue(store)
	messageID := uuid.MustParse("00000000-0000-4000-8000-000000000017")
	teamID := uuid.MustParse("00000000-0000-4000-8000-000000000042")

	if err := queue.EnqueueEmailDelivery(context.Background(), messageID, teamID); err != nil {
		t.Fatalf("enqueue email delivery: %v", err)
	}

	expectedEventID := uuid.NewSHA1(uuid.NameSpaceURL, []byte(deliveryNamespace+messageID.String()))
	if store.event.ID != expectedEventID {
		t.Fatalf("event id = %s, want %s", store.event.ID, expectedEventID)
	}
	if store.event.Subject != DeliverSubject {
		t.Fatalf("subject = %q, want %q", store.event.Subject, DeliverSubject)
	}
	if store.event.AggregateType != "email_message" || store.event.AggregateID != messageID {
		t.Fatalf("unexpected aggregate: %s/%s", store.event.AggregateType, store.event.AggregateID)
	}

	var command DeliverCommand
	if err := json.Unmarshal(store.event.Payload, &command); err != nil {
		t.Fatalf("decode command: %v", err)
	}
	if command.EventID != expectedEventID || command.MessageID != messageID || command.TeamID != teamID || command.SchemaVersion != 1 {
		t.Fatalf("unexpected command: %+v", command)
	}
}
