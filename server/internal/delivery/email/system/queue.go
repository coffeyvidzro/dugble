package systememail

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

const (
	DeliverSubject    = "dugble.job.email.system.v1"
	deliveryNamespace = "https://dugble.com/events/email/system/"
)

type eventStore interface {
	Enqueue(context.Context, outbox.Event) (uuid.UUID, error)
}

type DeliverCommand struct {
	EventID       uuid.UUID             `json:"event_id"`
	Message       platformemail.Message `json:"message"`
	SchemaVersion int                   `json:"schema_version"`
}

type Queue struct {
	store eventStore
}

func NewQueue(store eventStore) *Queue {
	return &Queue{store: store}
}

func (q *Queue) Send(ctx context.Context, message platformemail.Message) (platformemail.Result, error) {
	if q == nil || q.store == nil {
		return platformemail.Result{}, errors.New("system email outbox is not configured")
	}
	eventID := uuid.NewSHA1(uuid.NameSpaceURL, []byte(deliveryNamespace+uuid.NewString()))
	payload, err := json.Marshal(DeliverCommand{EventID: eventID, Message: message, SchemaVersion: 1})
	if err != nil {
		return platformemail.Result{}, err
	}
	_, err = q.store.Enqueue(ctx, outbox.Event{
		ID:            eventID,
		Subject:       DeliverSubject,
		AggregateType: "system_email",
		AggregateID:   eventID,
		Payload:       payload,
		Headers: map[string]string{
			"Dugble-Event-Type": "email.system.send.requested.v1",
		},
	})
	if err != nil {
		return platformemail.Result{}, err
	}
	return platformemail.Result{Provider: "outbox", MessageID: eventID.String()}, nil
}
