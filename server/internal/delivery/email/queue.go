package emaildelivery

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
)

const (
	DeliverSubject = "dugble.job.email.deliver.v1"
	eventNamespace = "https://dugble.com/events/email/delivery/"
)

type SendCommand struct {
	EventID   uuid.UUID `json:"event_id"`
	MessageID uuid.UUID `json:"message_id"`
	TeamID    uuid.UUID `json:"team_id"`
}

type eventStore interface {
	EnqueueTx(context.Context, pgx.Tx, outbox.Event) (uuid.UUID, error)
}

type Queue struct{ store eventStore }

func NewQueue(store eventStore) *Queue { return &Queue{store: store} }

func (q *Queue) EnqueueTx(ctx context.Context, tx pgx.Tx, messageID, teamID uuid.UUID) error {
	if q == nil || q.store == nil {
		return errors.New("email delivery outbox is not configured")
	}
	eventID := uuid.NewSHA1(uuid.NameSpaceURL, []byte(eventNamespace+messageID.String()))
	payload, err := json.Marshal(SendCommand{EventID: eventID, MessageID: messageID, TeamID: teamID})
	if err != nil {
		return err
	}
	_, err = q.store.EnqueueTx(ctx, tx, outbox.Event{
		ID: eventID, Subject: DeliverSubject, AggregateType: "email_message", AggregateID: messageID,
		Payload: payload, Headers: map[string]string{"Dugble-Event-Type": "email.delivery.requested.v1"},
	})
	return err
}
