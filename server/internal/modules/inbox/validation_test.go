package inbox

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestValidateCreateMessageNormalizesAndDeduplicates(t *testing.T) {
	validated, err := validateCreateMessage(CreateMessageRequest{
		Recipients: []string{" user-1 ", "user-1", "User-1"},
		Category: " Billing.Alert ",
		Title: " Payment failed ",
		Body: " Update your payment method. ",
		Data: json.RawMessage(`{"invoice_id":"inv_123"}`),
		Actions: []Action{{ID: "update_payment", Label: "Update payment", URL: "/billing/payment-method"}},
	})
	if err != nil {
		t.Fatalf("validateCreateMessage() error = %v", err)
	}
	if len(validated.Recipients) != 2 || validated.Recipients[0] != "user-1" || validated.Recipients[1] != "User-1" {
		t.Fatalf("recipients = %#v", validated.Recipients)
	}
	if validated.Category != "billing.alert" {
		t.Fatalf("category = %q", validated.Category)
	}
	if validated.Priority != PriorityNormal {
		t.Fatalf("priority = %q", validated.Priority)
	}
	var actions []Action
	if err := json.Unmarshal(validated.Actions, &actions); err != nil {
		t.Fatalf("decode actions: %v", err)
	}
	if len(actions) != 1 || actions[0].Style != ActionStyleLink {
		t.Fatalf("actions = %#v", actions)
	}
}

func TestValidateCreateMessageRejectsInvalidInputs(t *testing.T) {
	tests := []struct {
		name    string
		request CreateMessageRequest
	}{
		{name: "missing recipients", request: validCreateRequest(nil)},
		{name: "invalid priority", request: func() CreateMessageRequest { value := validCreateRequest([]string{"user"}); value.Priority = "critical"; return value }()},
		{name: "array data", request: func() CreateMessageRequest { value := validCreateRequest([]string{"user"}); value.Data = json.RawMessage(`[]`); return value }()},
		{name: "unsafe action", request: func() CreateMessageRequest { value := validCreateRequest([]string{"user"}); value.Actions = []Action{{ID: "open", Label: "Open", URL: "javascript:alert(1)"}}; return value }()},
		{name: "duplicate action", request: func() CreateMessageRequest { value := validCreateRequest([]string{"user"}); value.Actions = []Action{{ID: "open", Label: "Open", URL: "/one"}, {ID: "open", Label: "Again", URL: "/two"}}; return value }()},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if _, err := validateCreateMessage(test.request); err == nil {
				t.Fatal("validateCreateMessage() accepted invalid input")
			}
		})
	}
}

func TestValidateCreateMessageEnforcesRecipientLimit(t *testing.T) {
	recipients := make([]string, maxRecipients+1)
	for index := range recipients {
		recipients[index] = strings.Repeat("x", 1) + string(rune(index+1))
	}
	if _, err := validateCreateMessage(validCreateRequest(recipients)); err == nil {
		t.Fatal("validateCreateMessage() accepted too many recipients")
	}
}

func TestSafeActionURL(t *testing.T) {
	allowed := []string{"/billing", "https://example.com/billing"}
	for _, value := range allowed {
		if !safeActionURL(value) {
			t.Fatalf("safeActionURL(%q) = false", value)
		}
	}
	rejected := []string{"//example.com/path", "http://example.com", "javascript:alert(1)", "https://user@example.com"}
	for _, value := range rejected {
		if safeActionURL(value) {
			t.Fatalf("safeActionURL(%q) = true", value)
		}
	}
}

func validCreateRequest(recipients []string) CreateMessageRequest {
	return CreateMessageRequest{
		Recipients: recipients,
		Category: "general",
		Priority: PriorityNormal,
		Title: "Hello",
		Body: "World",
		Data: json.RawMessage(`{}`),
	}
}
