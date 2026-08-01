package emaildelivery

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/google/uuid"

	"github.com/coffeyvidzro/dugble/server/internal/messaging/outbox"
)

const (
	DeliverSubjectPrefix = "dugble.job.email.send.v1"
	deliveryNamespace    = "https://dugble.com/events/email/send/"
)

type DeliverCommand struct {
	EventID       uuid.UUID `json:"event_id"`
	MessageID     uuid.UUID `json:"message_id"`
	TeamID        uuid.UUID `json:"team_id"`
	Region        string    `json:"region"`
	SchemaVersion int       `json:"schema_version"`
}

func deliverySubject(region string) (string, error) {
	region = strings.ToLower(strings.TrimSpace(region))
	if region == "" {
		return "", errors.New("email delivery region is required")
	}
	for _, character := range region {
		if (character < 'a' || character > 'z') && (character < '0' || character > '9') && character != '-' {
			return "", errors.New("email delivery region contains invalid subject characters")
		}
	}
	return DeliverSubjectPrefix + "." + region, nil
}

func deliveryConsumerName(region string) (string, error) {
	subject, err := deliverySubject(region)
	if err != nil {
		return "", err
	}
	return "dugble-email-delivery-v1-" + strings.TrimPrefix(subject, DeliverSubjectPrefix+"."), nil
}

func newDeliveryEvent(messageID uuid.UUID, teamID uuid.UUID, region string) (outbox.Event, error) {
	subject, err := deliverySubject(region)
	if err != nil {
		return outbox.Event{}, err
	}
	region = strings.ToLower(strings.TrimSpace(region))
	eventID := uuid.NewSHA1(uuid.NameSpaceURL, []byte(deliveryNamespace+messageID.String()))
	payload, err := json.Marshal(DeliverCommand{
		EventID:       eventID,
		MessageID:     messageID,
		TeamID:        teamID,
		Region:        region,
		SchemaVersion: 1,
	})
	if err != nil {
		return outbox.Event{}, err
	}

	return outbox.Event{
		ID:            eventID,
		Subject:       subject,
		AggregateType: "email_message",
		AggregateID:   messageID,
		Payload:       payload,
		Headers: map[string]string{
			"Dugble-Event-Type": "email.send.requested.v1",
			"Dugble-Region":     region,
		},
	}, nil
}
