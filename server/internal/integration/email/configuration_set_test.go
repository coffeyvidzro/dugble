package email

import (
	"context"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ses"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

type configurationSetRecordingClient struct {
	input *ses.SendRawEmailInput
}

func (c *configurationSetRecordingClient) SendRawEmail(
	_ context.Context,
	input *ses.SendRawEmailInput,
	_ ...func(*ses.Options),
) (*ses.SendRawEmailOutput, error) {
	c.input = input
	return &ses.SendRawEmailOutput{MessageId: aws.String("provider-message-id")}, nil
}

func TestSendUsesConfiguredSESConfigurationSet(t *testing.T) {
	recordingClient := &configurationSetRecordingClient{}
	client, err := NewClient(
		"us-east-1",
		"default@example.com",
		"access-key",
		"secret-key",
		"dugble-transactional",
	)
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.sendingClients["us-east-1"] = recordingClient

	_, err = client.Send(context.Background(), platformemail.Message{
		From:    platformemail.Address{Email: "sender@example.com"},
		To:      []platformemail.Address{{Email: "recipient@example.com"}},
		Subject: "Configuration set",
		Text:    "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}
	if recordingClient.input == nil {
		t.Fatal("SendRawEmail was not called")
	}
	if got := aws.ToString(recordingClient.input.ConfigurationSetName); got != "dugble-transactional" {
		t.Fatalf("ConfigurationSetName = %q, want %q", got, "dugble-transactional")
	}
}

func TestSendOmitsBlankSESConfigurationSet(t *testing.T) {
	recordingClient := &configurationSetRecordingClient{}
	client, err := NewClient(
		"us-east-1",
		"default@example.com",
		"access-key",
		"secret-key",
		"   ",
	)
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.sendingClients["us-east-1"] = recordingClient

	_, err = client.Send(context.Background(), platformemail.Message{
		From:    platformemail.Address{Email: "sender@example.com"},
		To:      []platformemail.Address{{Email: "recipient@example.com"}},
		Subject: "No configuration set",
		Text:    "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}
	if recordingClient.input == nil {
		t.Fatal("SendRawEmail was not called")
	}
	if recordingClient.input.ConfigurationSetName != nil {
		t.Fatalf("ConfigurationSetName = %q, want nil", aws.ToString(recordingClient.input.ConfigurationSetName))
	}
}
