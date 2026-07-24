package sms

import (
	"encoding/json"
	"errors"
	"strings"
	"testing"
	"time"

	apperrors "github.com/coffeyvidzro/dugble/server/pkg/errors"
)

func TestValidateSendRequiresE164Recipient(t *testing.T) {
	_, err := validateSend(SendRequest{To: "0241234567", From: "DUGBLE", Body: "hello"})
	if err == nil {
		t.Fatal("validateSend returned nil error for non-E.164 recipient")
	}
}

func TestValidateSendDefaultsMetadata(t *testing.T) {
	req, err := validateSend(SendRequest{To: "+233241234567", From: "DUGBLE", Body: "hello"})
	if err != nil {
		t.Fatalf("validateSend returned error: %v", err)
	}
	if string(req.Metadata) != "{}" {
		t.Fatalf("Metadata = %s, want {}", req.Metadata)
	}
}

func TestValidateBatchSendRequiresMessages(t *testing.T) {
	if err := validateBatchSend(BatchSendRequest{}); err == nil {
		t.Fatal("validateBatchSend returned nil error for empty batch")
	}
}

func TestValidateBatchSendLimitsMessages(t *testing.T) {
	messages := make([]SendRequest, maxBatchMessages+1)
	for i := range messages {
		messages[i] = SendRequest{To: "+233241234567", From: "DUGBLE", Body: "hello"}
	}
	if err := validateBatchSend(BatchSendRequest{Messages: messages}); err == nil {
		t.Fatal("validateBatchSend returned nil error for oversized batch")
	}
}

func TestValidateBatchSendDefersItemValidation(t *testing.T) {
	err := validateBatchSend(BatchSendRequest{Messages: []SendRequest{
		{To: "+233241234567", From: "DUGBLE", Body: "hello"},
		{To: "0241234567", From: "DUGBLE", Body: "hello"},
	}})
	if err != nil {
		t.Fatalf("validateBatchSend returned error for item-level validation: %v", err)
	}
}

func TestCountSegments(t *testing.T) {
	if got := countSegments("hello"); got != 1 {
		t.Fatalf("countSegments short = %d, want 1", got)
	}
	long := make([]rune, 161)
	for i := range long {
		long[i] = 'a'
	}
	if got := countSegments(string(long)); got != 2 {
		t.Fatalf("countSegments long = %d, want 2", got)
	}

	ucs2 := make([]rune, 71)
	for i := range ucs2 {
		ucs2[i] = '界'
	}
	if got := countSegments(string(ucs2)); got != 2 {
		t.Fatalf("countSegments UCS-2 = %d, want 2", got)
	}

	emoji := make([]rune, 36)
	for i := range emoji {
		emoji[i] = '😀'
	}
	if got := countSegments(string(emoji)); got != 2 {
		t.Fatalf("countSegments emoji = %d, want 2", got)
	}

	extended := make([]rune, 81)
	for i := range extended {
		extended[i] = '^'
	}
	if got := countSegments(string(extended)); got != 2 {
		t.Fatalf("countSegments GSM-7 extended = %d, want 2", got)
	}
}

func TestDefaultCostMicrosPerSegment(t *testing.T) {
	if defaultCostMicrosPerSegment != 9_000 {
		t.Fatalf("defaultCostMicrosPerSegment = %d, want 9000", defaultCostMicrosPerSegment)
	}
}

func TestBillingFromCost(t *testing.T) {
	billing := billingFromCost(2, 18_000)
	if billing.UnitCost != 0.009 {
		t.Fatalf("UnitCost = %v, want 0.009", billing.UnitCost)
	}
	if billing.TotalCost != 0.018 {
		t.Fatalf("TotalCost = %v, want 0.018", billing.TotalCost)
	}
	if billing.Currency != "USD" {
		t.Fatalf("Currency = %q, want USD", billing.Currency)
	}
}

func TestSMSResponseJSONUsesPublicRepresentation(t *testing.T) {
	now := time.Date(2026, time.July, 24, 12, 0, 0, 0, time.UTC)
	providerID := "arkesel"
	providerMessageID := "provider-secret"
	internalError := "upstream payload that must not be exposed"
	message := Message{
		ID:                "message-id",
		TeamID:            "team-id",
		To:                "+233241234567",
		From:              "DUGBLE",
		Body:              "hello",
		Status:            StatusFailed,
		ProviderID:        &providerID,
		ProviderMessageID: &providerMessageID,
		Segments:          1,
		CostMicros:        9_000,
		Billing:           billingFromCost(1, 9_000),
		ErrorMessage:      &internalError,
		Metadata:          json.RawMessage(`{"campaign":"welcome"}`),
		SubmittedAt:       &now,
		CreatedAt:         now,
		UpdatedAt:         now,
	}
	payload, err := json.Marshal(message.Response())
	if err != nil {
		t.Fatalf("Marshal returned error: %v", err)
	}
	body := string(payload)
	for _, hidden := range []string{"cost_micros", "team_id", "sender_id", "provider_id", "provider_message_id", "error_message", internalError} {
		if strings.Contains(body, hidden) {
			t.Fatalf("SMS response JSON should not expose %s: %s", hidden, body)
		}
	}
	for _, expected := range []string{
		`"metadata":{"campaign":"welcome"}`,
		`"segments":1`,
		`"unit_cost":0.009`,
		`"total_cost":0.009`,
		`"submitted_at":"2026-07-24T12:00:00Z"`,
		`"updated_at":"2026-07-24T12:00:00Z"`,
		`"failure":{"code":"SMS_FAILED","message":"SMS delivery failed"}`,
	} {
		if !strings.Contains(body, expected) {
			t.Fatalf("SMS response JSON missing %s: %s", expected, body)
		}
	}
}

func TestResponsesMapsEveryMessageToPublicDTO(t *testing.T) {
	responses := Responses([]Message{{ID: "first"}, {ID: "second"}})
	if len(responses) != 2 || responses[0].ID != "first" || responses[1].ID != "second" {
		t.Fatalf("Responses() = %#v", responses)
	}
}

func TestNewBatchSendErrorDoesNotExposeWrappedCause(t *testing.T) {
	err := apperrors.NewInternal("Unable to enqueue SMS delivery", errors.New("postgres password leaked here"))
	result := newBatchSendError(err)
	if result.Code != "INTERNAL_ERROR" || result.Message != "Unable to enqueue SMS delivery" {
		t.Fatalf("newBatchSendError() = %#v", result)
	}
	if strings.Contains(result.Message, "postgres") {
		t.Fatalf("newBatchSendError exposed wrapped cause: %#v", result)
	}
}

func TestResolveProviderStatusPreventsRegression(t *testing.T) {
	tests := []struct {
		name     string
		current  string
		provider string
		want     string
	}{
		{name: "unknown does not replace submitted", current: StatusSubmitted, provider: StatusUnknown, want: StatusSubmitted},
		{name: "submitted does not replace sent", current: StatusSent, provider: StatusSubmitted, want: StatusSent},
		{name: "submitted does not replace delivered", current: StatusDelivered, provider: StatusSubmitted, want: StatusDelivered},
		{name: "failure does not replace delivered", current: StatusDelivered, provider: StatusFailed, want: StatusDelivered},
		{name: "sent advances submitted", current: StatusSubmitted, provider: StatusSent, want: StatusSent},
		{name: "delivered advances sent", current: StatusSent, provider: StatusDelivered, want: StatusDelivered},
		{name: "rejected closes submitted", current: StatusSubmitted, provider: StatusRejected, want: StatusRejected},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := resolveProviderStatus(test.current, test.provider); got != test.want {
				t.Fatalf("resolveProviderStatus(%q, %q) = %q, want %q", test.current, test.provider, got, test.want)
			}
		})
	}
}
