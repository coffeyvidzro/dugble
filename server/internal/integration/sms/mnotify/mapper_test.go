package mnotify

import (
	"testing"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

func TestMapStatusAccepted(t *testing.T) {
	if got := mapStatus(sendResponse{Code: "1000"}); got != sms.StatusAccepted {
		t.Fatalf("mapStatus = %q, want %q", got, sms.StatusAccepted)
	}
}

func TestToSendResultUsesFallbackID(t *testing.T) {
	result := toSendResult(ProviderName, []byte(`{"code":"1000"}`), sendResponse{ID: "abc"})
	if result.ProviderMessageID != "abc" {
		t.Fatalf("ProviderMessageID = %q, want abc", result.ProviderMessageID)
	}
}
