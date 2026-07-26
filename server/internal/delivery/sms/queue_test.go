package smsdelivery

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
)

func TestQueueEnqueueTxCreatesDeterministicOutboxEvent(t *testing.T) {
	messageID := uuid.New()
	teamID := uuid.New()
	store := &fakeEventStore{}
	queue := NewQueue(store)

	if err := queue.EnqueueSMSDeliveryTx(context.Background(), nil, messageID, teamID); err != nil {
		t.Fatalf("EnqueueSMSDeliveryTx returned error: %v", err)
	}
	if len(store.events) != 1 {
		t.Fatalf("events = %d, want 1", len(store.events))
	}

	event := store.events[0]
	if event.Subject != DeliverSubject {
		t.Fatalf("subject = %q, want %q", event.Subject, DeliverSubject)
	}
	if event.AggregateID != messageID {
		t.Fatalf("aggregate ID = %s, want %s", event.AggregateID, messageID)
	}
	if event.ID == uuid.Nil {
		t.Fatal("event ID is nil")
	}

	second, err := newDeliveryEvent(messageID, teamID)
	if err != nil {
		t.Fatalf("newDeliveryEvent returned error: %v", err)
	}
	if second.ID != event.ID {
		t.Fatalf("event ID = %s, second ID = %s; want deterministic IDs", event.ID, second.ID)
	}
}

type fakeEventStore struct {
	events []outbox.Event
}

func (s *fakeEventStore) Enqueue(_ context.Context, event outbox.Event) (uuid.UUID, error) {
	s.events = append(s.events, event)
	return event.ID, nil
}

func (s *fakeEventStore) EnqueueTx(_ context.Context, _ pgx.Tx, event outbox.Event) (uuid.UUID, error) {
	s.events = append(s.events, event)
	return event.ID, nil
}
