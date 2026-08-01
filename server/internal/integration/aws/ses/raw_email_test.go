package ses

import (
	"context"
	"errors"
	"reflect"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/smithy-go"

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

func TestSendAddsDeliveryCorrelationTags(t *testing.T) {
	recordingClient := &recordingSESClient{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.sendingClients["us-east-1"] = recordingClient

	_, err = client.Send(context.Background(), platformemail.Message{
		MessageID: "message-123",
		AttemptID: "attempt-456",
		From:      platformemail.Address{Email: "sender@example.com"},
		To:        []platformemail.Address{{Email: "recipient@example.com"}},
		Subject:   "Correlation",
		Text:      "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}
	if len(recordingClient.input.Tags) != 2 {
		t.Fatalf("Tags = %#v, want two correlation tags", recordingClient.input.Tags)
	}
	got := map[string]string{}
	for _, tag := range recordingClient.input.Tags {
		got[aws.ToString(tag.Name)] = aws.ToString(tag.Value)
	}
	if got[messageIDTagName] != "message-123" || got[attemptIDTagName] != "attempt-456" {
		t.Fatalf("correlation tags = %#v", got)
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

type fakeSESAPIError struct {
	code    string
	message string
}

func (e fakeSESAPIError) Error() string                 { return e.code }
func (e fakeSESAPIError) ErrorCode() string             { return e.code }
func (e fakeSESAPIError) ErrorMessage() string          { return e.message }
func (e fakeSESAPIError) ErrorFault() smithy.ErrorFault { return smithy.FaultServer }

func TestShouldRetryWithoutConfigurationSetForAccessDeniedConfigSet(t *testing.T) {
	if !shouldRetryWithoutConfigurationSet(fakeSESAPIError{code: "AccessDenied", message: "User is not authorized to perform ses:SendRawEmail on resource arn:aws:ses:eu-north-1:123456789012:configuration-set/dugble-transactional"}) {
		t.Fatal("shouldRetryWithoutConfigurationSet() = false, want true")
	}
}

func TestShouldRetryWithoutConfigurationSetForOtherErrors(t *testing.T) {
	if shouldRetryWithoutConfigurationSet(fakeSESAPIError{code: "AccessDenied", message: "User is not authorized to perform ses:SendRawEmail"}) {
		t.Fatal("shouldRetryWithoutConfigurationSet() = true, want false")
	}
}

func TestClassifySESFailureTreatsTransportErrorsAsUnknown(t *testing.T) {
	err := classifySESFailure(errors.New("connection reset"))
	if !platformemail.IsSubmissionUnknown(err) || platformemail.IsRetryable(err) {
		t.Fatalf("transport failure classification = %v", err)
	}
}

func TestClassifySESFailureKeepsExplicitThrottlingRetryable(t *testing.T) {
	err := classifySESFailure(fakeSESAPIError{code: "Throttling"})
	if platformemail.IsSubmissionUnknown(err) || !platformemail.IsRetryable(err) {
		t.Fatalf("throttling classification = %v", err)
	}
}

func TestClassifySESFailureTreatsRequestTimeoutAsUnknown(t *testing.T) {
	err := classifySESFailure(fakeSESAPIError{code: "RequestTimeout"})
	if !platformemail.IsSubmissionUnknown(err) || platformemail.IsRetryable(err) {
		t.Fatalf("request timeout classification = %v", err)
	}
}
