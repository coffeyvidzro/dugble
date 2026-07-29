package email

import (
	"context"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ses"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

type recordingSESClient struct {
	calls int
	input *ses.SendRawEmailInput
}

func (c *recordingSESClient) SendRawEmail(_ context.Context, input *ses.SendRawEmailInput, _ ...func(*ses.Options)) (*ses.SendRawEmailOutput, error) {
	c.calls++
	c.input = input
	return &ses.SendRawEmailOutput{MessageId: aws.String("provider-message-id")}, nil
}

func TestSendUsesConfiguredSESConfigurationSet(t *testing.T) {
	recorder := &recordingSESClient{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key", "dugble-transactional")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.sendingClients["us-east-1"] = recorder

	_, err = client.Send(context.Background(), platformemail.Message{
		From:    platformemail.Address{Email: "sender@example.com"},
		To:      []platformemail.Address{{Email: "recipient@example.com"}},
		Subject: "Configuration set",
		Text:    "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}
	if recorder.input == nil {
		t.Fatal("expected SES send input")
	}
	if got := aws.ToString(recorder.input.ConfigurationSetName); got != "dugble-transactional" {
		t.Fatalf("configuration set = %q", got)
	}
}

func TestSendUsesMessageRegion(t *testing.T) {
	defaultClient, regionalClient := &recordingSESClient{}, &recordingSESClient{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.sendingClients["us-east-1"] = defaultClient
	client.sendingClients["eu-west-1"] = regionalClient

	_, err = client.Send(context.Background(), platformemail.Message{
		Region:  "eu-west-1",
		From:    platformemail.Address{Email: "sender@example.com"},
		To:      []platformemail.Address{{Email: "recipient@example.com"}},
		Subject: "Regional delivery",
		Text:    "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}
	if regionalClient.calls != 1 || defaultClient.calls != 0 {
		t.Fatalf("regional calls = %d, default calls = %d", regionalClient.calls, defaultClient.calls)
	}
}
