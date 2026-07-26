package email

import (
	"encoding/json"
	"testing"
)

var testServiceConfig = ServiceConfig{
	DefaultFromEmail: "hello@dugble.com",
	DefaultFromName:  "Dugble",
}

func TestValidateSendNormalizesAndHashesRequest(t *testing.T) {
	req := SendRequest{
		To:             Recipient{Email: "Customer@Example.com", Name: " Customer "},
		Subject:        " Welcome ",
		HTML:           "<p>Hello</p>",
		Metadata:       json.RawMessage(`{"customer_id":"123","enabled":true}`),
		IdempotencyKey: " welcome-123 ",
	}

	validated, err := validateSend(req, testServiceConfig)
	if err != nil {
		t.Fatalf("validate email: %v", err)
	}
	if validated.ToEmail != "customer@example.com" {
		t.Fatalf("to email = %q", validated.ToEmail)
	}
	if validated.FromEmail != "hello@dugble.com" {
		t.Fatalf("from email = %q", validated.FromEmail)
	}
	if validated.ToName == nil || *validated.ToName != "Customer" {
		t.Fatalf("to name = %v", validated.ToName)
	}
	if validated.IdempotencyKey == nil || *validated.IdempotencyKey != "welcome-123" {
		t.Fatalf("idempotency key = %v", validated.IdempotencyKey)
	}
	if validated.IdempotencyHash == nil || len(*validated.IdempotencyHash) != 64 {
		t.Fatalf("idempotency hash = %v", validated.IdempotencyHash)
	}
}

func TestValidateSendCanonicalMetadataProducesStableHash(t *testing.T) {
	first, err := validateSend(SendRequest{
		To:             Recipient{Email: "customer@example.com"},
		Subject:        "Welcome",
		Text:           "Hello",
		Metadata:       json.RawMessage(`{"b":2,"a":1}`),
		IdempotencyKey: "same-request",
	}, testServiceConfig)
	if err != nil {
		t.Fatalf("validate first email: %v", err)
	}
	second, err := validateSend(SendRequest{
		To:             Recipient{Email: "customer@example.com"},
		Subject:        "Welcome",
		Text:           "Hello",
		Metadata:       json.RawMessage(`{ "a": 1, "b": 2 }`),
		IdempotencyKey: "same-request",
	}, testServiceConfig)
	if err != nil {
		t.Fatalf("validate second email: %v", err)
	}
	if *first.IdempotencyHash != *second.IdempotencyHash {
		t.Fatalf("hashes differ: %s != %s", *first.IdempotencyHash, *second.IdempotencyHash)
	}
}

func TestValidateSendRejectsUnconfiguredSender(t *testing.T) {
	_, err := validateSend(SendRequest{
		To:      Recipient{Email: "customer@example.com"},
		From:    &Recipient{Email: "other@example.com"},
		Subject: "Welcome",
		Text:    "Hello",
	}, testServiceConfig)
	if err == nil {
		t.Fatal("expected sender validation error")
	}
}

func TestValidateSendRejectsMissingBodyAndNonObjectMetadata(t *testing.T) {
	_, err := validateSend(SendRequest{
		To:       Recipient{Email: "customer@example.com"},
		Subject:  "Welcome",
		Metadata: json.RawMessage(`[]`),
	}, testServiceConfig)
	if err == nil {
		t.Fatal("expected body validation error")
	}

	_, err = validateSend(SendRequest{
		To:       Recipient{Email: "customer@example.com"},
		Subject:  "Welcome",
		Text:     "Hello",
		Metadata: json.RawMessage(`[]`),
	}, testServiceConfig)
	if err == nil {
		t.Fatal("expected metadata validation error")
	}
}
