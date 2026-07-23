package sms

import "testing"

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
