package sms

import "testing"

func TestSendRequestNormalizeDefaultsTrafficClassToA2P(t *testing.T) {
	req := (SendRequest{To: " +233241234567 ", From: " DUGBLE ", Message: "hello"}).Normalize()
	if req.TrafficClass != TrafficClassA2P {
		t.Fatalf("TrafficClass = %q, want %q", req.TrafficClass, TrafficClassA2P)
	}
}

func TestSendRequestValidateRejectsUnknownTrafficClass(t *testing.T) {
	err := (SendRequest{
		To:           "+233241234567",
		From:         "DUGBLE",
		Message:      "hello",
		TrafficClass: "cheap",
	}).Validate()
	if err == nil {
		t.Fatal("Validate returned nil error for unknown traffic class")
	}
}

func TestIsKnownTrafficClassNormalizesInput(t *testing.T) {
	if !IsKnownTrafficClass(" Local ") {
		t.Fatal("IsKnownTrafficClass returned false for normalized local class")
	}
}
