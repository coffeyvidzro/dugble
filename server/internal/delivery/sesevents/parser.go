package sesevents

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

var ErrUnsupportedEventType = errors.New("unsupported SES event type")

type sesPayload struct {
	EventType        string               `json:"eventType"`
	NotificationType string               `json:"notificationType"`
	Mail             sesMail              `json:"mail"`
	Bounce           *sesBounce           `json:"bounce"`
	Complaint        *sesComplaint        `json:"complaint"`
	Delivery         *sesDelivery         `json:"delivery"`
	DeliveryDelay    *sesDeliveryDelay    `json:"deliveryDelay"`
	Reject           *sesReject           `json:"reject"`
	Failure          *sesRenderingFailure `json:"failure"`
}

type sesMail struct {
	Timestamp   string   `json:"timestamp"`
	MessageID   string   `json:"messageId"`
	Destination []string `json:"destination"`
}

type sesRecipient struct {
	Email          string `json:"emailAddress"`
	Action         string `json:"action"`
	Status         string `json:"status"`
	DiagnosticCode string `json:"diagnosticCode"`
}

type sesBounce struct {
	Type         string         `json:"bounceType"`
	Subtype      string         `json:"bounceSubType"`
	Recipients   []sesRecipient `json:"bouncedRecipients"`
	Timestamp    string         `json:"timestamp"`
	FeedbackID   string         `json:"feedbackId"`
	ReportingMTA string         `json:"reportingMTA"`
}

type sesComplaint struct {
	Recipients   []sesRecipient `json:"complainedRecipients"`
	Timestamp    string         `json:"timestamp"`
	FeedbackID   string         `json:"feedbackId"`
	Subtype      string         `json:"complaintSubType"`
	FeedbackType string         `json:"complaintFeedbackType"`
	UserAgent    string         `json:"userAgent"`
	ArrivalDate  string         `json:"arrivalDate"`
}

type sesDelivery struct {
	Timestamp            string   `json:"timestamp"`
	ProcessingTimeMillis int64    `json:"processingTimeMillis"`
	Recipients           []string `json:"recipients"`
	SMTPResponse         string   `json:"smtpResponse"`
	ReportingMTA         string   `json:"reportingMTA"`
	RemoteMTAIP          string   `json:"remoteMtaIp"`
}

type sesDeliveryDelay struct {
	Type           string         `json:"delayType"`
	Recipients     []sesRecipient `json:"delayedRecipients"`
	ExpirationTime string         `json:"expirationTime"`
	ReportingMTA   string         `json:"reportingMTA"`
	Timestamp      string         `json:"timestamp"`
}

type sesReject struct {
	Reason string `json:"reason"`
}

type sesRenderingFailure struct {
	TemplateName string `json:"templateName"`
	ErrorMessage string `json:"errorMessage"`
}

// ParseProviderEvent validates and normalizes an Amazon SES event-publishing payload.
func ParseProviderEvent(payload []byte) (ProviderEvent, error) {
	var source sesPayload
	if err := json.Unmarshal(payload, &source); err != nil {
		return ProviderEvent{}, fmt.Errorf("decode SES event: %w", err)
	}
	messageID := strings.TrimSpace(source.Mail.MessageID)
	if messageID == "" {
		return ProviderEvent{}, errors.New("SES event is missing mail.messageId")
	}
	eventType := strings.TrimSpace(source.EventType)
	if eventType == "" {
		eventType = strings.TrimSpace(source.NotificationType)
	}
	event := ProviderEvent{ProviderMessageID: messageID}
	var err error
	switch eventType {
	case "Send":
		event.Type = EventTypeSend
		event.OccurredAt, err = parseRequiredTime("mail.timestamp", source.Mail.Timestamp)
		event.Recipients = stringRecipients(source.Mail.Destination)
	case "Delivery":
		if source.Delivery == nil {
			return ProviderEvent{}, errors.New("SES Delivery event is missing delivery details")
		}
		event.Type = EventTypeDelivery
		event.OccurredAt, err = parseRequiredTime("delivery.timestamp", source.Delivery.Timestamp)
		event.Recipients = stringRecipients(source.Delivery.Recipients)
		event.Delivery = &DeliveryDetails{ProcessingTimeMillis: source.Delivery.ProcessingTimeMillis, SMTPResponse: source.Delivery.SMTPResponse, ReportingMTA: source.Delivery.ReportingMTA, RemoteMTAIP: source.Delivery.RemoteMTAIP}
	case "DeliveryDelay":
		if source.DeliveryDelay == nil {
			return ProviderEvent{}, errors.New("SES DeliveryDelay event is missing deliveryDelay details")
		}
		event.Type = EventTypeDeliveryDelay
		event.OccurredAt, err = parseRequiredTime("deliveryDelay.timestamp", source.DeliveryDelay.Timestamp)
		event.Recipients = objectRecipients(source.DeliveryDelay.Recipients)
		var expiration *time.Time
		if source.DeliveryDelay.ExpirationTime != "" {
			parsed, parseErr := parseRequiredTime("deliveryDelay.expirationTime", source.DeliveryDelay.ExpirationTime)
			if parseErr != nil {
				return ProviderEvent{}, parseErr
			}
			expiration = &parsed
		}
		event.Delay = &DelayDetails{Type: source.DeliveryDelay.Type, ExpirationAt: expiration, ReportingMTA: source.DeliveryDelay.ReportingMTA}
	case "Bounce":
		if source.Bounce == nil {
			return ProviderEvent{}, errors.New("SES Bounce event is missing bounce details")
		}
		event.Type = EventTypeBounce
		event.OccurredAt, err = parseRequiredTime("bounce.timestamp", source.Bounce.Timestamp)
		event.Recipients = objectRecipients(source.Bounce.Recipients)
		event.Bounce = &BounceDetails{Type: source.Bounce.Type, Subtype: source.Bounce.Subtype, FeedbackID: source.Bounce.FeedbackID, ReportingMTA: source.Bounce.ReportingMTA}
	case "Complaint":
		if source.Complaint == nil {
			return ProviderEvent{}, errors.New("SES Complaint event is missing complaint details")
		}
		event.Type = EventTypeComplaint
		event.OccurredAt, err = parseRequiredTime("complaint.timestamp", source.Complaint.Timestamp)
		event.Recipients = objectRecipients(source.Complaint.Recipients)
		var arrival *time.Time
		if source.Complaint.ArrivalDate != "" {
			parsed, parseErr := parseRequiredTime("complaint.arrivalDate", source.Complaint.ArrivalDate)
			if parseErr != nil {
				return ProviderEvent{}, parseErr
			}
			arrival = &parsed
		}
		event.Complaint = &ComplaintDetails{Subtype: source.Complaint.Subtype, FeedbackType: source.Complaint.FeedbackType, FeedbackID: source.Complaint.FeedbackID, UserAgent: source.Complaint.UserAgent, ArrivalAt: arrival}
	case "Reject":
		if source.Reject == nil {
			return ProviderEvent{}, errors.New("SES Reject event is missing reject details")
		}
		event.Type = EventTypeReject
		event.OccurredAt, err = parseRequiredTime("mail.timestamp", source.Mail.Timestamp)
		event.Recipients = stringRecipients(source.Mail.Destination)
		event.Reject = &RejectDetails{Reason: source.Reject.Reason}
	case "Rendering Failure":
		if source.Failure == nil {
			return ProviderEvent{}, errors.New("SES Rendering Failure event is missing failure details")
		}
		event.Type = EventTypeRenderingFailure
		event.OccurredAt, err = parseRequiredTime("mail.timestamp", source.Mail.Timestamp)
		event.Recipients = stringRecipients(source.Mail.Destination)
		event.RenderingFailure = &RenderingFailureDetails{TemplateName: source.Failure.TemplateName, ErrorMessage: source.Failure.ErrorMessage}
	default:
		return ProviderEvent{}, fmt.Errorf("%w: %q", ErrUnsupportedEventType, eventType)
	}
	if err != nil {
		return ProviderEvent{}, err
	}
	return event, nil
}

func parseRequiredTime(field, value string) (time.Time, error) {
	parsed, err := time.Parse(time.RFC3339Nano, strings.TrimSpace(value))
	if err != nil {
		return time.Time{}, fmt.Errorf("SES event has invalid %s: %w", field, err)
	}
	return parsed.UTC(), nil
}

func stringRecipients(values []string) []Recipient {
	result := make([]Recipient, 0, len(values))
	for _, value := range values {
		if value = strings.TrimSpace(value); value != "" {
			result = append(result, Recipient{Email: value})
		}
	}
	return result
}

func objectRecipients(values []sesRecipient) []Recipient {
	result := make([]Recipient, 0, len(values))
	for _, value := range values {
		if email := strings.TrimSpace(value.Email); email != "" {
			result = append(result, Recipient{Email: email, Action: value.Action, Status: value.Status, DiagnosticCode: value.DiagnosticCode})
		}
	}
	return result
}
