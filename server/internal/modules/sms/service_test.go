package sms

import (
	"encoding/json"
	"strings"
	"testing"
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

func TestValidateBatchSendValidatesEachMessage(t *testing.T) {
	err := validateBatchSend(BatchSendRequest{Messages: []SendRequest{
		{To: "+233241234567", From: "DUGBLE", Body: "hello"},
		{To: "0241234567", From: "DUGBLE", Body: "hello"},
	}})
	if err == nil {
		t.Fatal("validateBatchSend returned nil error for invalid message")
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
	if billing.Units != 2 {
		t.Fatalf("Units = %d, want 2", billing.Units)
	}
	if billing.Pricing.UnitCost != 0.009 {
		t.Fatalf("UnitCost = %v, want 0.009", billing.Pricing.UnitCost)
	}
	if billing.Pricing.TotalCost != 0.018 {
		t.Fatalf("TotalCost = %v, want 0.018", billing.Pricing.TotalCost)
	}
	if billing.Pricing.Currency != "USD" {
		t.Fatalf("Currency = %q, want USD", billing.Pricing.Currency)
	}
}

func TestMessageJSONUsesBillingRepresentation(t *testing.T) {
	message := Message{Segments: 1, CostMicros: 9_000, Billing: billingFromCost(1, 9_000)}
	payload, err := json.Marshal(message)
	if err != nil {
		t.Fatalf("Marshal returned error: %v", err)
	}
	body := string(payload)
	if strings.Contains(body, "cost_micros") {
		t.Fatalf("Message JSON should not expose internal cost_micros: %s", body)
	}
	if !strings.Contains(body, `"billing"`) || !strings.Contains(body, `"unitCost":0.009`) || !strings.Contains(body, `"totalCost":0.009`) {
		t.Fatalf("Message JSON missing billing money representation: %s", body)
	}
}
