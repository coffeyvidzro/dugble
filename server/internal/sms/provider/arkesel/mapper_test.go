package arkesel

import (
	"testing"

	"github.com/coffeyvidzro/dugble/server/internal/sms/provider"
)

func TestToSendRequest(t *testing.T) {
	mapped := toSendRequest(provider.SendRequest{From: "DUGBLE", To: "+233201234567", Body: "Hello"})
	if mapped.Sender != "DUGBLE" || mapped.Message != "Hello" || len(mapped.Recipients) != 1 || mapped.Recipients[0] != "+233201234567" {
		t.Fatalf("unexpected mapped request: %#v", mapped)
	}
}

func TestMapStatusAccepted(t *testing.T) {
	if got := mapStatus(sendResponse{Status: "success"}); got != provider.StatusAccepted {
		t.Fatalf("mapStatus = %q, want %q", got, provider.StatusAccepted)
	}
}
