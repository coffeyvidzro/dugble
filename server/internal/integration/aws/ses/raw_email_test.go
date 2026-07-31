package ses

import (
	"context"
	"errors"
	"reflect"
	"strings"
	"testing"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

func TestSendUsesEnvelopeDestinationsForBCC(t *testing.T) {
	recordingClient := &recordingSESClient{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.sendingClients["us-east-1"] = recordingClient

	_, err = client.Send(context.Background(), platformemail.Message{
		From:    platformemail.Address{Email: "sender@example.com"},
		To:      []platformemail.Address{{Email: "to@example.com"}},
		CC:      []platformemail.Address{{Email: "cc@example.com"}},
		BCC:     []platformemail.Address{{Email: "hidden@example.com"}, {Email: "TO@example.com"}},
		Subject: "BCC delivery",
		Text:    "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}

	wantDestinations := []string{"to@example.com", "cc@example.com", "hidden@example.com"}
	if !reflect.DeepEqual(recordingClient.input.Destinations, wantDestinations) {
		t.Fatalf("Destinations = %#v, want %#v", recordingClient.input.Destinations, wantDestinations)
	}
	raw := string(recordingClient.input.RawMessage.Data)
	if strings.Contains(strings.ToLower(raw), "\r\nbcc:") || strings.HasPrefix(strings.ToLower(raw), "bcc:") {
		t.Fatalf("raw MIME exposed a Bcc header:\n%s", raw)
	}
}

func TestBuildMIMERejectsOversizedEncodedMessage(t *testing.T) {
	_, err := buildMIME(platformemail.Message{
		From:    platformemail.Address{Email: "sender@example.com"},
		To:      []platformemail.Address{{Email: "recipient@example.com"}},
		Subject: "Oversized",
		Text:    strings.Repeat("x", maxSESRawMessageBytes),
	})
	if !errors.Is(err, ErrMessageTooLarge) {
		t.Fatalf("buildMIME() error = %v, want ErrMessageTooLarge", err)
	}
}

func TestBuildMIMERejectsReservedHeaders(t *testing.T) {
	tests := []string{
		"X-SES-SOURCE-ARN",
		"x-amazon-trace-id",
		"Date",
		"Message-ID",
		"Return-Path",
	}
	for _, header := range tests {
		t.Run(header, func(t *testing.T) {
			_, err := buildMIME(platformemail.Message{
				From:    platformemail.Address{Email: "sender@example.com"},
				To:      []platformemail.Address{{Email: "recipient@example.com"}},
				Subject: "Reserved header",
				Text:    "Hello",
				Headers: map[string]string{header: "value"},
			})
			if !errors.Is(err, ErrReservedHeader) {
				t.Fatalf("buildMIME() error = %v, want ErrReservedHeader", err)
			}
		})
	}
}

func TestBuildMIMEAllowsApplicationHeaders(t *testing.T) {
	raw, err := buildMIME(platformemail.Message{
		From:    platformemail.Address{Email: "sender@example.com"},
		To:      []platformemail.Address{{Email: "recipient@example.com"}},
		Subject: "Custom header",
		Text:    "Hello",
		Headers: map[string]string{"X-Dugble-Trace": "trace-123"},
	})
	if err != nil {
		t.Fatalf("buildMIME() error = %v", err)
	}
	if !strings.Contains(string(raw), "X-Dugble-Trace: trace-123\r\n") {
		t.Fatalf("raw MIME does not contain the allowed custom header:\n%s", raw)
	}
}
