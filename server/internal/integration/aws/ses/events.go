package ses

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

var ErrInvalidEvent = errors.New("invalid SES feedback event")

type FeedbackEvent struct {
	EventType         string          `json:"event_type"`
	ProviderMessageID string          `json:"provider_message_id"`
	OccurredAt        time.Time       `json:"occurred_at"`
	Recipients        []string        `json:"recipients"`
	BounceType        string          `json:"bounce_type,omitempty"`
	BounceSubType     string          `json:"bounce_sub_type,omitempty"`
	ComplaintType     string          `json:"complaint_type,omitempty"`
	RejectReason      string          `json:"reject_reason,omitempty"`
	FailureReason     string          `json:"failure_reason,omitempty"`
	Payload           json.RawMessage `json:"-"`
}

type feedbackEnvelope struct {
	EventType string `json:"eventType"`
	Mail      struct {
		Timestamp   time.Time `json:"timestamp"`
		MessageID   string    `json:"messageId"`
		Destination []string  `json:"destination"`
	} `json:"mail"`
	Send struct {
		Timestamp time.Time `json:"timestamp"`
	} `json:"send"`
	Delivery struct {
		Timestamp  time.Time `json:"timestamp"`
		Recipients []string  `json:"recipients"`
	} `json:"delivery"`
	DeliveryDelay struct {
		Timestamp         time.Time `json:"timestamp"`
		DelayedRecipients []struct {
			EmailAddress string `json:"emailAddress"`
		} `json:"delayedRecipients"`
	} `json:"deliveryDelay"`
	Bounce struct {
		Timestamp         time.Time `json:"timestamp"`
		BounceType        string    `json:"bounceType"`
		BounceSubType     string    `json:"bounceSubType"`
		BouncedRecipients []struct {
			EmailAddress string `json:"emailAddress"`
		} `json:"bouncedRecipients"`
	} `json:"bounce"`
	Complaint struct {
		Timestamp             time.Time `json:"timestamp"`
		ComplaintFeedbackType string    `json:"complaintFeedbackType"`
		ComplainedRecipients  []struct {
			EmailAddress string `json:"emailAddress"`
		} `json:"complainedRecipients"`
	} `json:"complaint"`
	Reject struct {
		Timestamp time.Time `json:"timestamp"`
		Reason    string    `json:"reason"`
	} `json:"reject"`
	Failure struct {
		Timestamp    time.Time `json:"timestamp"`
		ErrorMessage string    `json:"errorMessage"`
	} `json:"failure"`
}

func ParseFeedbackEvent(message string) (FeedbackEvent, error) {
	raw := json.RawMessage(strings.TrimSpace(message))
	if len(raw) == 0 || !json.Valid(raw) {
		return FeedbackEvent{}, fmt.Errorf("%w: payload must be valid JSON", ErrInvalidEvent)
	}

	var envelope feedbackEnvelope
	if err := json.Unmarshal(raw, &envelope); err != nil {
		return FeedbackEvent{}, fmt.Errorf("%w: decode payload: %v", ErrInvalidEvent, err)
	}

	eventType, occurredAt, recipients, err := normalizeFeedbackEvent(envelope)
	if err != nil {
		return FeedbackEvent{}, err
	}
	messageID := strings.TrimSpace(envelope.Mail.MessageID)
	if messageID == "" {
		return FeedbackEvent{}, fmt.Errorf("%w: mail.messageId is required", ErrInvalidEvent)
	}
	if occurredAt.IsZero() {
		occurredAt = envelope.Mail.Timestamp
	}
	if occurredAt.IsZero() {
		return FeedbackEvent{}, fmt.Errorf("%w: event timestamp is required", ErrInvalidEvent)
	}
	if len(recipients) == 0 {
		recipients = normalizeRecipients(envelope.Mail.Destination)
	}

	return FeedbackEvent{
		EventType:         eventType,
		ProviderMessageID: messageID,
		OccurredAt:        occurredAt.UTC(),
		Recipients:        recipients,
		BounceType:        strings.TrimSpace(envelope.Bounce.BounceType),
		BounceSubType:     strings.TrimSpace(envelope.Bounce.BounceSubType),
		ComplaintType:     strings.TrimSpace(envelope.Complaint.ComplaintFeedbackType),
		RejectReason:      strings.TrimSpace(envelope.Reject.Reason),
		FailureReason:     strings.TrimSpace(envelope.Failure.ErrorMessage),
		Payload:           append(json.RawMessage(nil), raw...),
	}, nil
}

func normalizeFeedbackEvent(envelope feedbackEnvelope) (string, time.Time, []string, error) {
	switch strings.ToLower(strings.TrimSpace(envelope.EventType)) {
	case "send":
		return "send", envelope.Send.Timestamp, nil, nil
	case "delivery":
		return "delivery", envelope.Delivery.Timestamp, normalizeRecipients(envelope.Delivery.Recipients), nil
	case "deliverydelay", "delivery_delay":
		return "delivery_delay", envelope.DeliveryDelay.Timestamp, delayedRecipients(envelope.DeliveryDelay.DelayedRecipients), nil
	case "bounce":
		return "bounce", envelope.Bounce.Timestamp, bouncedRecipients(envelope.Bounce.BouncedRecipients), nil
	case "complaint":
		return "complaint", envelope.Complaint.Timestamp, complainedRecipients(envelope.Complaint.ComplainedRecipients), nil
	case "reject":
		return "reject", envelope.Reject.Timestamp, nil, nil
	case "rendering failure", "renderingfailure", "rendering_failure":
		return "rendering_failure", envelope.Failure.Timestamp, nil, nil
	default:
		return "", time.Time{}, nil, fmt.Errorf("%w: unsupported event type %q", ErrInvalidEvent, envelope.EventType)
	}
}

func normalizeRecipients(values []string) []string {
	result := make([]string, 0, len(values))
	seen := make(map[string]struct{}, len(values))
	for _, value := range values {
		value = strings.ToLower(strings.TrimSpace(value))
		if value == "" {
			continue
		}
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}
	return result
}

func delayedRecipients(values []struct {
	EmailAddress string `json:"emailAddress"`
}) []string {
	recipients := make([]string, 0, len(values))
	for _, value := range values {
		recipients = append(recipients, value.EmailAddress)
	}
	return normalizeRecipients(recipients)
}

func bouncedRecipients(values []struct {
	EmailAddress string `json:"emailAddress"`
}) []string {
	recipients := make([]string, 0, len(values))
	for _, value := range values {
		recipients = append(recipients, value.EmailAddress)
	}
	return normalizeRecipients(recipients)
}

func complainedRecipients(values []struct {
	EmailAddress string `json:"emailAddress"`
}) []string {
	recipients := make([]string, 0, len(values))
	for _, value := range values {
		recipients = append(recipients, value.EmailAddress)
	}
	return normalizeRecipients(recipients)
}
