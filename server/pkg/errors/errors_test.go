package errors

import (
	"errors"
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

func TestNewServiceUnavailable(t *testing.T) {
	cause := errors.New("NATS unavailable")
	err := NewServiceUnavailable("service is unavailable", cause)
	if err.Code != "SERVICE_UNAVAILABLE" {
		t.Fatalf("code = %q, want SERVICE_UNAVAILABLE", err.Code)
	}
	if err.Status != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, want %d", err.Status, http.StatusServiceUnavailable)
	}
	if !errors.Is(err, cause) {
		t.Fatal("service unavailable error must wrap its cause")
	}
}
