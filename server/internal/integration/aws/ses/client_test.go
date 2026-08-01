package ses

import (
	"context"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

type recordingSESV2Client struct {
	calls int
	input *sesv2.SendEmailInput
}

func (c *recordingSESV2Client) SendEmail(_ context.Context, input *sesv2.SendEmailInput, _ ...func(*sesv2.Options)) (*sesv2.SendEmailOutput, error) {
	c.calls++
	c.input = input
	return &sesv2.SendEmailOutput{MessageId: aws.String("provider-message-id")}, nil
}

func TestSendUsesMessageRegion(t *testing.T) {
	defaultClient, regionalClient := &recordingSESV2Client{}, &recordingSESV2Client{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.v2SendingClients["us-east-1"] = defaultClient
	client.v2SendingClients["eu-west-1"] = regionalClient
	route := platformemail.CustomerDeliveryRoute("transactional", "dugble-t-customer")
	_, err = client.Send(context.Background(), platformemail.Message{
		Region:           "eu-west-1",
		Stream:           route.Stream,
		ConfigurationSet: route.ConfigurationSet,
		SESTenantName:    route.SESTenantName,
		From:             platformemail.Address{Email: "sender@example.com"},
		To:               []platformemail.Address{{Email: "recipient@example.com"}},
		Subject:          "Regional delivery",
		Text:             "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}
	if regionalClient.calls != 1 || defaultClient.calls != 0 {
		t.Fatalf("regional calls = %d, default calls = %d", regionalClient.calls, defaultClient.calls)
	}
}

func TestSendUsesPersistedConfigurationSetAndTenant(t *testing.T) {
	recordingClient := &recordingSESV2Client{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.v2SendingClients["us-east-1"] = recordingClient
	route := platformemail.CustomerDeliveryRoute("marketing", "dugble-t-customer")
	_, err = client.Send(context.Background(), platformemail.Message{
		Stream:           route.Stream,
		ConfigurationSet: route.ConfigurationSet,
		SESTenantName:    route.SESTenantName,
		From:             platformemail.Address{Email: "sender@example.com"},
		To:               []platformemail.Address{{Email: "recipient@example.com"}},
		Subject:          "Configuration set",
		Text:             "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}
	if got := aws.ToString(recordingClient.input.ConfigurationSetName); got != "dugble-marketing" {
		t.Fatalf("ConfigurationSetName = %q, want %q", got, "dugble-marketing")
	}
	if got := aws.ToString(recordingClient.input.TenantName); got != "dugble-t-customer" {
		t.Fatalf("TenantName = %q, want %q", got, "dugble-t-customer")
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
	records := mapVerificationRecords(platformemail.DomainProvisionRequest{Domain: "example.com", Region: "us-east-1", CustomReturnPath: "send", SESTenantName: "dugble-t-customer"}, "dugble123", "public-key")
	if len(records) != 3 {
		t.Fatalf("records length = %d, want 3", len(records))
	}
	if records[0].Record != platformemail.RecordDKIM || records[1].Type != platformemail.RecordTypeMX || records[2].Type != platformemail.RecordTypeTXT {
		t.Fatalf("unexpected verification records: %#v", records)
	}
}
