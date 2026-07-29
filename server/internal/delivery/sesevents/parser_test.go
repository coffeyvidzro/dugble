package sesevents

import (
	"errors"
	"testing"
	"time"
)

func TestParseProviderEvent(t *testing.T) {
	tests := []struct {
		name       string
		payload    string
		wantType   EventType
		wantTime   string
		wantEmail  string
		assertions func(*testing.T, ProviderEvent)
	}{
		{name: "send", payload: `{"eventType":"Send","mail":{"timestamp":"2026-07-29T12:00:00.000Z","messageId":"ses-1","destination":["ada@example.com"]},"send":{}}`, wantType: EventTypeSend, wantTime: "2026-07-29T12:00:00Z", wantEmail: "ada@example.com"},
		{name: "delivery", payload: `{"eventType":"Delivery","mail":{"timestamp":"2026-07-29T12:00:00Z","messageId":"ses-1"},"delivery":{"timestamp":"2026-07-29T12:00:02Z","processingTimeMillis":2000,"recipients":["ada@example.com"],"smtpResponse":"250 accepted","reportingMTA":"a8-1.smtp-out.amazonses.com","remoteMtaIp":"192.0.2.1"}}`, wantType: EventTypeDelivery, wantTime: "2026-07-29T12:00:02Z", wantEmail: "ada@example.com", assertions: func(t *testing.T, event ProviderEvent) {
			if event.Delivery == nil || event.Delivery.ProcessingTimeMillis != 2000 || event.Delivery.SMTPResponse != "250 accepted" {
				t.Fatalf("delivery details = %#v", event.Delivery)
			}
		}},
		{name: "delivery delay", payload: `{"eventType":"DeliveryDelay","mail":{"timestamp":"2026-07-29T12:00:00Z","messageId":"ses-1"},"deliveryDelay":{"delayType":"MailboxFull","delayedRecipients":[{"emailAddress":"ada@example.com","status":"4.2.2","diagnosticCode":"smtp; 452 full"}],"expirationTime":"2026-07-30T12:00:00Z","reportingMTA":"dns; example.com","timestamp":"2026-07-29T12:05:00Z"}}`, wantType: EventTypeDeliveryDelay, wantTime: "2026-07-29T12:05:00Z", wantEmail: "ada@example.com", assertions: func(t *testing.T, event ProviderEvent) {
			if event.Delay == nil || event.Delay.Type != "MailboxFull" || event.Delay.ExpirationAt == nil || event.Recipients[0].Status != "4.2.2" {
				t.Fatalf("delay event = %#v", event)
			}
		}},
		{name: "bounce", payload: `{"eventType":"Bounce","mail":{"timestamp":"2026-07-29T12:00:00Z","messageId":"ses-1"},"bounce":{"bounceType":"Permanent","bounceSubType":"NoEmail","bouncedRecipients":[{"emailAddress":"ada@example.com","action":"failed","status":"5.1.1","diagnosticCode":"smtp; 550 unknown"}],"timestamp":"2026-07-29T12:01:00Z","feedbackId":"bounce-1","reportingMTA":"dns; example.com"}}`, wantType: EventTypeBounce, wantTime: "2026-07-29T12:01:00Z", wantEmail: "ada@example.com", assertions: func(t *testing.T, event ProviderEvent) {
			if event.Bounce == nil || event.Bounce.Type != "Permanent" || event.Bounce.Subtype != "NoEmail" || event.Recipients[0].Action != "failed" {
				t.Fatalf("bounce event = %#v", event)
			}
		}},
		{name: "complaint", payload: `{"eventType":"Complaint","mail":{"timestamp":"2026-07-29T12:00:00Z","messageId":"ses-1"},"complaint":{"complainedRecipients":[{"emailAddress":"ada@example.com"}],"timestamp":"2026-07-29T12:02:00Z","feedbackId":"complaint-1","complaintSubType":"OnAccountSuppressionList","complaintFeedbackType":"abuse","userAgent":"Example FBL","arrivalDate":"2026-07-29T12:01:30Z"}}`, wantType: EventTypeComplaint, wantTime: "2026-07-29T12:02:00Z", wantEmail: "ada@example.com", assertions: func(t *testing.T, event ProviderEvent) {
			if event.Complaint == nil || event.Complaint.FeedbackType != "abuse" || event.Complaint.ArrivalAt == nil {
				t.Fatalf("complaint details = %#v", event.Complaint)
			}
		}},
		{name: "reject", payload: `{"eventType":"Reject","mail":{"timestamp":"2026-07-29T12:00:00Z","messageId":"ses-1","destination":["ada@example.com"]},"reject":{"reason":"Bad content"}}`, wantType: EventTypeReject, wantTime: "2026-07-29T12:00:00Z", wantEmail: "ada@example.com", assertions: func(t *testing.T, event ProviderEvent) {
			if event.Reject == nil || event.Reject.Reason != "Bad content" {
				t.Fatalf("reject details = %#v", event.Reject)
			}
		}},
		{name: "rendering failure", payload: `{"eventType":"Rendering Failure","mail":{"timestamp":"2026-07-29T12:00:00Z","messageId":"ses-1","destination":["ada@example.com"]},"failure":{"templateName":"welcome","errorMessage":"Missing attribute name"}}`, wantType: EventTypeRenderingFailure, wantTime: "2026-07-29T12:00:00Z", wantEmail: "ada@example.com", assertions: func(t *testing.T, event ProviderEvent) {
			if event.RenderingFailure == nil || event.RenderingFailure.TemplateName != "welcome" {
				t.Fatalf("rendering failure = %#v", event.RenderingFailure)
			}
		}},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			event, err := ParseProviderEvent([]byte(test.payload))
			if err != nil {
				t.Fatalf("parse provider event: %v", err)
			}
			if event.Type != test.wantType || event.ProviderMessageID != "ses-1" {
				t.Fatalf("event identity = %#v", event)
			}
			wantTime, _ := time.Parse(time.RFC3339, test.wantTime)
			if !event.OccurredAt.Equal(wantTime) {
				t.Fatalf("occurred at = %s, want %s", event.OccurredAt, wantTime)
			}
			if len(event.Recipients) != 1 || event.Recipients[0].Email != test.wantEmail {
				t.Fatalf("recipients = %#v", event.Recipients)
			}
			if test.assertions != nil {
				test.assertions(t, event)
			}
		})
	}
}

func TestParseProviderEventSupportsNotificationType(t *testing.T) {
	event, err := ParseProviderEvent([]byte(`{"notificationType":"Delivery","mail":{"messageId":"ses-1"},"delivery":{"timestamp":"2026-07-29T12:00:00Z","recipients":["ada@example.com"]}}`))
	if err != nil {
		t.Fatalf("parse notificationType event: %v", err)
	}
	if event.Type != EventTypeDelivery {
		t.Fatalf("event type = %q", event.Type)
	}
}

func TestParseProviderEventRejectsInvalidPayloads(t *testing.T) {
	tests := []struct {
		name, payload string
		target        error
	}{
		{name: "malformed JSON", payload: `{`},
		{name: "missing message ID", payload: `{"eventType":"Send","mail":{"timestamp":"2026-07-29T12:00:00Z"}}`},
		{name: "missing event details", payload: `{"eventType":"Bounce","mail":{"messageId":"ses-1"}}`},
		{name: "invalid timestamp", payload: `{"eventType":"Delivery","mail":{"messageId":"ses-1"},"delivery":{"timestamp":"yesterday"}}`},
		{name: "unsupported event", payload: `{"eventType":"Open","mail":{"messageId":"ses-1"}}`, target: ErrUnsupportedEventType},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, err := ParseProviderEvent([]byte(test.payload))
			if err == nil {
				t.Fatal("expected parsing to fail")
			}
			if test.target != nil && !errors.Is(err, test.target) {
				t.Fatalf("error = %v, want %v", err, test.target)
			}
		})
	}
}
