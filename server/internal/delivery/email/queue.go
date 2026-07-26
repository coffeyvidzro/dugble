package emaildelivery

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
)

const (
	DeliverSubject    = "dugble.job.email.send.v1"
	deliveryNamespace = "https://dugble.com/events/email/send/"
)

type DeliverCommand struct {
	EventID       uuid.UUID `json:"event_id"`
	MessageID     uuid.UUID `json:"message_id"`
	TeamID        uuid.UUID `json:"team_id"`
	SchemaVersion int       `json:"schema_version"`
}

type eventStore interface {
	Enqueue(context.Context, outbox.Event) (uuid.UUID, error)
	EnqueueTx(context.Context, pgx.Tx, outbox.Event) (uuid.UUID, error)
}

type Queue struct {
	store eventStore
}

func NewQueue(store eventStore) *Queue { return &Queue{store: store} }

func (q *Queue) EnqueueEmailDelivery(ctx context.Context, messageID uuid.UUID, teamID uuid.UUID) error {
	if q == nil || q.store == nil {
		return errors.New("email delivery outbox is not configured")
	}
	event, err := newDeliveryEvent(messageID, teamID)
	if err != nil {
		return err
	}
	_, err = q.store.Enqueue(ctx, event)
	return err
}

func (q *Queue) EnqueueEmailDeliveryTx(ctx context.Context, tx pgx.Tx, messageID uuid.UUID, teamID uuid.UUID) error {
	return q.EnqueueEmailDeliveryAtTx(ctx, tx, messageID, teamID, time.Time{})
}

func (q *Queue) EnqueueEmailDeliveryAtTx(ctx context.Context, tx pgx.Tx, messageID uuid.UUID, teamID uuid.UUID, availableAt time.Time) error {
	if q == nil || q.store == nil {
		return errors.New("email delivery outbox is not configured")
	}
	event, err := newDeliveryEvent(messageID, teamID)
	if err != nil {
		return err
	}
	event.AvailableAt = availableAt
	_, err = q.store.EnqueueTx(ctx, tx, event)
	return err
}

func newDeliveryEvent(messageID uuid.UUID, teamID uuid.UUID) (outbox.Event, error) {
	eventID := uuid.NewSHA1(uuid.NameSpaceURL, []byte(deliveryNamespace+messageID.String()))
	payload, err := json.Marshal(DeliverCommand{
		EventID:       eventID,
		MessageID:     messageID,
		TeamID:        teamID,
		SchemaVersion: 1,
	})
	if err != nil {
		return outbox.Event{}, err
	}

	return outbox.Event{
		ID:            eventID,
		Subject:       DeliverSubject,
		AggregateType: "email_message",
		AggregateID:   messageID,
		Payload:       payload,
		Headers: map[string]string{
			"Dugble-Event-Type": "email.send.requested.v1",
		},
	}, nil
}
