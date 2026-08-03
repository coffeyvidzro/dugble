package ses

import (
	"context"
	"strings"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"

	platformemail "github.com/coffeyvidzro/dugble/server/internal/platform/email"
)

func TestSendPreservesFriendlyFromName(t *testing.T) {
	recordingClient := &recordingSESV2Client{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.v2SendingClients["us-east-1"] = recordingClient
	route, err := platformemail.CustomerDeliveryRoute("transactional", "dugble-t-customer")
	if err != nil {
		t.Fatalf("create customer route: %v", err)
	}

	_, err = client.Send(context.Background(), platformemail.Message{
		Stream:           route.Stream,
		ConfigurationSet: route.ConfigurationSet,
		SESTenantName:    route.SESTenantName,
		From:             platformemail.Address{Email: "onboarding@runnage.dev", Name: "Dugble"},
		To:               []platformemail.Address{{Email: "recipient@example.com"}},
		Subject:          "Welcome",
		Text:             "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}

	const want = "Dugble <onboarding@runnage.dev>"
	if got := aws.ToString(recordingClient.input.FromEmailAddress); got != want {
		t.Fatalf("FromEmailAddress = %q, want %q", got, want)
	}
	if raw := string(recordingClient.input.Content.Raw.Data); !strings.Contains(raw, "From: "+want+"\r\n") {
		t.Fatalf("raw MIME does not contain matching friendly From header:\n%s", raw)
	}
}

func TestSendEncodesUnicodeFriendlyFromName(t *testing.T) {
	recordingClient := &recordingSESV2Client{}
	client, err := NewClient("us-east-1", "default@example.com", "access-key", "secret-key")
	if err != nil {
		t.Fatalf("create client: %v", err)
	}
	client.v2SendingClients["us-east-1"] = recordingClient
	route, err := platformemail.CustomerDeliveryRoute("transactional", "dugble-t-customer")
	if err != nil {
		t.Fatalf("create customer route: %v", err)
	}

	_, err = client.Send(context.Background(), platformemail.Message{
		Stream:           route.Stream,
		ConfigurationSet: route.ConfigurationSet,
		SESTenantName:    route.SESTenantName,
		From:             platformemail.Address{Email: "onboarding@runnage.dev", Name: "Dugblé"},
		To:               []platformemail.Address{{Email: "recipient@example.com"}},
		Subject:          "Welcome",
		Text:             "Hello",
	})
	if err != nil {
		t.Fatalf("send email: %v", err)
	}

	got := aws.ToString(recordingClient.input.FromEmailAddress)
	if !strings.Contains(got, "=?UTF-8?") || !strings.HasSuffix(got, " <onboarding@runnage.dev>") {
		t.Fatalf("FromEmailAddress = %q, want an RFC 2047 encoded display name", got)
	}
	if raw := string(recordingClient.input.Content.Raw.Data); !strings.Contains(raw, "From: "+got+"\r\n") {
		t.Fatalf("raw MIME From header does not match SES FromEmailAddress:\n%s", raw)
	}
}
