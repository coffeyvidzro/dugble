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
