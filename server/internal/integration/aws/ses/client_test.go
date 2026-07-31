package ses

import (
	"context"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsses "github.com/aws/aws-sdk-go-v2/service/ses"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

type recordingSESClient struct {
	calls int
	input *awsses.SendRawEmailInput
}

func (c *recordingSESClient) SendRawEmail(_ context.Context, input *awsses.SendRawEmailInput, _ ...func(*awsses.Options)) (*awsses.SendRawEmailOutput, error) {
	c.calls++
	c.input = input
	return &awsses.SendRawEmailOutput{MessageId: aws.String("provider-message-id")}, nil
}

func TestSendUsesMessageRegion(t *testing.T) {
	defaultClient, regionalClient := &recordingSESClient{}, &recordingSESClient{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.sendingClients["us-east-1"] = defaultClient
	client.sendingClients["eu-west-1"] = regionalClient
	_, err = client.Send(context.Background(), platformemail.Message{Region: "eu-west-1", From: platformemail.Address{Email: "sender@example.com"}, To: []platformemail.Address{{Email: "recipient@example.com"}}, Subject: "Regional delivery", Text: "Hello"})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}
	if regionalClient.calls != 1 || defaultClient.calls != 0 {
		t.Fatalf("regional calls = %d, default calls = %d", regionalClient.calls, defaultClient.calls)
	}
}

func TestSendUsesConfiguredSESConfigurationSet(t *testing.T) {
	recordingClient := &recordingSESClient{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key", "dugble-transactional")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.sendingClients["us-east-1"] = recordingClient
	_, err = client.Send(context.Background(), platformemail.Message{From: platformemail.Address{Email: "sender@example.com"}, To: []platformemail.Address{{Email: "recipient@example.com"}}, Subject: "Configuration set", Text: "Hello"})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}
	if got := aws.ToString(recordingClient.input.ConfigurationSetName); got != "dugble-transactional" {
		t.Fatalf("ConfigurationSetName = %q, want %q", got, "dugble-transactional")
	}
}

func TestGenerateBYODKIMMaterial(t *testing.T) {
	selector, privateKey, publicKey, err := generateBYODKIMMaterial()
	if err != nil {
		t.Fatalf("generateBYODKIMMaterial returned error: %v", err)
	}
	if selector == "" || privateKey == "" || publicKey == "" {
		t.Fatal("generateBYODKIMMaterial returned an empty value")
	}
	if len(selector) > 63 || !strings.HasPrefix(selector, "dugble") {
		t.Fatalf("selector = %q", selector)
	}
}

func TestMapVerificationRecords(t *testing.T) {
	records := mapVerificationRecords(platformemail.DomainProvisionRequest{Domain: "example.com", Region: "us-east-1", CustomReturnPath: "send"}, "dugble123", "public-key")
	if len(records) != 3 {
		t.Fatalf("records length = %d, want 3", len(records))
	}
	if records[0].Record != platformemail.RecordDKIM || records[1].Type != platformemail.RecordTypeMX || records[2].Type != platformemail.RecordTypeTXT {
		t.Fatalf("unexpected verification records: %#v", records)
	}
}
