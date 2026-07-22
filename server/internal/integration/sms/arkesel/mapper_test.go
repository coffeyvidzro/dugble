package arkesel

import (
	"testing"

	"github.com/coffeyvidzro/dugble/server/internal/integration/sms"
)

func TestToSendRequest(t *testing.T) {
	mapped := toSendRequest(sms.SendRequest{From: "DUGBLE", To: "+233201234567", Body: "Hello"})
	if mapped.Sender != "DUGBLE" || mapped.Message != "Hello" || len(mapped.Recipients) != 1 || mapped.Recipients[0] != "+233201234567" {
		t.Fatalf("unexpected mapped request: %#v", mapped)
	}
}

func TestMapStatusAccepted(t *testing.T) {
	if got := mapStatus(sendResponse{Status: "success"}); got != sms.StatusAccepted {
		t.Fatalf("mapStatus = %q, want %q", got, sms.StatusAccepted)
	}
}
