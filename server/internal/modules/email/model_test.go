package email

import (
	"bytes"
	"encoding/json"
	"testing"
)

func TestMessageSummaryOmitsContentBodies(t *testing.T) {
	htmlBody := "<p>sensitive body</p>"
	textBody := "sensitive body"
	message := Message{
		ID:       "message-id",
		ToEmail:  "recipient@example.com",
		Subject:  "Subject",
		HTMLBody: &htmlBody,
		TextBody: &textBody,
		Status:   StatusQueued,
	}

	encoded, err := json.Marshal(message.Summary())
	if err != nil {
		t.Fatalf("marshal message summary: %v", err)
	}
	for _, forbidden := range [][]byte{[]byte("html_body"), []byte("text_body"), []byte("sensitive body")} {
		if bytes.Contains(encoded, forbidden) {
			t.Fatalf("summary contains %q: %s", forbidden, encoded)
		}
	}
}

func TestBatchSendRequestAcceptsTopLevelArray(t *testing.T) {
	var request BatchSendRequest
	if err := json.Unmarshal([]byte(`[
		{"to":"first@example.com","subject":"First","text":"one"},
		{"to":["second@example.com"],"subject":"Second","html":"<p>two</p>"}
	]`), &request); err != nil {
		t.Fatalf("unmarshal batch: %v", err)
	}
	if len(request.Messages) != 2 || request.Messages[1].To[0].Email != "second@example.com" {
		t.Fatalf("unexpected batch: %#v", request)
	}
}

func TestSendResponsesContainOnlyIDsInRequestOrder(t *testing.T) {
	encoded, err := json.Marshal(SendResponses([]Message{{ID: "first", Subject: "secret"}, {ID: "second"}}))
	if err != nil {
		t.Fatalf("marshal responses: %v", err)
	}
	if string(encoded) != `[{"id":"first"},{"id":"second"}]` {
		t.Fatalf("unexpected response: %s", encoded)
	}
}
