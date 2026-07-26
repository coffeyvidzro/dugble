package webhooks

import "testing"

func TestValidateCreateEndpoint(t *testing.T) {
	t.Parallel()

	value, err := validateCreateEndpoint(CreateEndpointRequest{
		URL:              " https://example.com/webhooks ",
		SubscribedEvents: []string{EventSMSDelivered, EventSMSDelivered, EventSMSFailed},
	})
	if err != nil {
		t.Fatalf("validate endpoint: %v", err)
	}
	if value.URL != "https://example.com/webhooks" {
		t.Fatalf("unexpected URL %q", value.URL)
	}
	if value.APIVersion != DefaultAPIVersion {
		t.Fatalf("unexpected API version %q", value.APIVersion)
	}
	if len(value.SubscribedEvents) != 2 {
		t.Fatalf("expected deduplicated events, got %v", value.SubscribedEvents)
	}
}

func TestValidateCreateEndpointRejectsUnsupportedEvent(t *testing.T) {
	t.Parallel()

	_, err := validateCreateEndpoint(CreateEndpointRequest{
		URL:              "https://example.com/webhooks",
		SubscribedEvents: []string{"sms.unknown"},
	})
	if err == nil {
		t.Fatal("expected unsupported event error")
	}
}
