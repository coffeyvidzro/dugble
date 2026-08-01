package ses

import (
	"encoding/json"
	"testing"
)

func TestParseFeedbackEventNormalizesSESDetails(t *testing.T) {
	event, err := ParseFeedbackEvent(`{
		"eventType":"Bounce",
		"mail":{
			"timestamp":"2026-07-31T08:00:00Z",
			"messageId":" ses-message-id ",
			"destination":["Fallback@example.com"],
			"tags":{
				"dugble_message_id":[" message-123 "],
				"dugble_attempt_id":["attempt-456"],
				"campaign":["summer","summer"]
			}
		},
		"bounce":{"timestamp":"2026-07-31T08:01:00Z","bounceType":"Permanent","bounceSubType":"General","bouncedRecipients":[{"emailAddress":"USER@example.com"},{"emailAddress":"user@example.com"}]}
	}`)
	if err != nil {
		t.Fatalf("ParseFeedbackEvent() error = %v", err)
	}
	if event.EventType != "bounce" || event.ProviderMessageID != "ses-message-id" {
		t.Fatalf("unexpected event identity: %#v", event)
	}
	if event.InternalMessageID != "message-123" || event.InternalAttemptID != "attempt-456" {
		t.Fatalf("correlation tags were not normalized: %#v", event)
	}
	if values := event.Tags["campaign"]; len(values) != 1 || values[0] != "summer" {
		t.Fatalf("tags = %#v", event.Tags)
	}
	if event.BounceType != "Permanent" || event.BounceSubType != "General" {
		t.Fatalf("bounce details were not normalized: %#v", event)
	}
	if len(event.Recipients) != 1 || event.Recipients[0] != "user@example.com" {
		t.Fatalf("recipients = %#v", event.Recipients)
	}
	encoded, err := json.Marshal(event)
	if err != nil {
		t.Fatalf("marshal normalized event: %v", err)
	}
	if !json.Valid(encoded) {
		t.Fatalf("normalized event is invalid JSON: %s", encoded)
	}
}
