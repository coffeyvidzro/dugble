package errors

import (
	"net/http"
	"testing"
)

func TestNewPayloadTooLarge(t *testing.T) {
	err := NewPayloadTooLarge("request is too large")
	if err.Code != "PAYLOAD_TOO_LARGE" {
		t.Fatalf("code = %q, want PAYLOAD_TOO_LARGE", err.Code)
	}
	if err.Message != "request is too large" {
		t.Fatalf("message = %q, want request is too large", err.Message)
	}
	if err.Status != http.StatusRequestEntityTooLarge {
		t.Fatalf("status = %d, want %d", err.Status, http.StatusRequestEntityTooLarge)
	}
}
