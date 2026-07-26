package email

import (
	"encoding/json"
	"testing"
	"time"
)

func TestSendRequestAcceptsResendStyleAddresses(t *testing.T) {
	var request SendRequest
	if err := json.Unmarshal([]byte(`{
		"from":"Dugble <sender@example.com>",
		"to":["Ada <ada@example.com>","grace@example.com"],
		"cc":"team@example.com",
		"reply_to":["support@example.com"],
		"subject":"Hello",
		"html":"<p>Hello</p>"
	}`), &request); err != nil {
		t.Fatalf("decode request: %v", err)
	}

	validated, err := validateSend(request, ServiceConfig{DefaultFromEmail: "sender@example.com"})
	if err != nil {
		t.Fatalf("validate request: %v", err)
	}
	if len(validated.To) != 2 || validated.To[0].Name != "Ada" || len(validated.CC) != 1 || len(validated.ReplyTo) != 1 {
		t.Fatalf("unexpected normalized recipients: %#v", validated)
	}
}

func TestValidateSendSupportsSchedulingAndAdvancedOptions(t *testing.T) {
	request := SendRequest{
		To: EmailAddressList{{Email: "recipient@example.com"}}, Subject: "Hello", Text: "Hello",
		ScheduledAt: "in 5 min", Headers: map[string]string{"X-Campaign": "launch"},
		Attachments: []Attachment{{Filename: "hello.txt", Content: "aGVsbG8="}},
		Tags:        []Tag{{Name: "campaign", Value: "launch_1"}},
	}
	validated, err := validateSend(request, ServiceConfig{DefaultFromEmail: "sender@example.com"})
	if err != nil {
		t.Fatalf("validate request: %v", err)
	}
	if validated.ScheduledAt == nil || time.Until(*validated.ScheduledAt) < 4*time.Minute {
		t.Fatalf("schedule was not preserved: %v", validated.ScheduledAt)
	}
}

func TestValidateSendLimitsAllRecipientsTogether(t *testing.T) {
	recipients := make(EmailAddressList, 51)
	for index := range recipients {
		recipients[index] = EmailAddress{Email: "recipient@example.com"}
	}
	_, err := validateSend(SendRequest{To: recipients, Subject: "Hello", Text: "Hello"}, ServiceConfig{DefaultFromEmail: "sender@example.com"})
	if err == nil {
		t.Fatal("expected recipient limit error")
	}
}

func TestNormalizeAttachmentsUsesExactDecodedSize(t *testing.T) {
	for encoded, expected := range map[string]int{"YQ==": 1, "YWI=": 2, "YWJj": 3} {
		size, err := attachmentContentSize(encoded)
		if err != nil {
			t.Fatalf("measure %q: %v", encoded, err)
		}
		if size != expected {
			t.Fatalf("decoded size of %q = %d, want %d", encoded, size, expected)
		}
	}
}
