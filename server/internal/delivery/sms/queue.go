package smsdelivery

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
)

const deliveryEventNamespace = "https://dugble.com/events/sms/delivery/"

type eventStore interface {
	Enqueue(context.Context, outbox.Event) (uuid.UUID, error)
	EnqueueTx(context.Context, pgx.Tx, outbox.Event) (uuid.UUID, error)
}

type Queue struct {
	store eventStore
}

func NewQueue(store eventStore) *Queue { return &Queue{store: store} }

func (q *Queue) EnqueueSMSDelivery(ctx context.Context, messageID uuid.UUID, teamID uuid.UUID) error {
	if q == nil || q.store == nil {
		return errors.New("SMS delivery outbox is not configured")
	}
	event, err := newDeliveryEvent(messageID, teamID)
	if err != nil {
		return err
	}
	_, err = q.store.Enqueue(ctx, event)
	return err
}

func (q *Queue) EnqueueSMSDeliveryTx(ctx context.Context, tx pgx.Tx, messageID uuid.UUID, teamID uuid.UUID) error {
	if q == nil || q.store == nil {
		return errors.New("SMS delivery outbox is not configured")
	}
	event, err := newDeliveryEvent(messageID, teamID)
	if err != nil {
		return err
	}
	_, err = q.store.EnqueueTx(ctx, tx, event)
	return err
}

func newDeliveryEvent(messageID uuid.UUID, teamID uuid.UUID) (outbox.Event, error) {
	eventID := uuid.NewSHA1(uuid.NameSpaceURL, []byte(deliveryEventNamespace+messageID.String()))
	payload, err := json.Marshal(DeliverCommand{
		EventID:   eventID,
		MessageID: messageID,
		TeamID:    teamID,
	})
	if err != nil {
		return outbox.Event{}, err
	}

	return outbox.Event{
		ID:            eventID,
		Subject:       DeliverSubject,
		AggregateType: "sms_message",
		AggregateID:   messageID,
		Payload:       payload,
		Headers: map[string]string{
			"Dugble-Event-Type": "sms.delivery.requested.v1",
		},
	}, nil
}
