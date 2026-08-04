package dispatch

import (
	"testing"

	"github.com/google/uuid"
)

func TestEventIDIsStablePerChallenge(t *testing.T) {
	challengeID := uuid.New()
	if EventID(challengeID) != EventID(challengeID) {
		t.Fatal("EventID is not deterministic")
	}
	if EventID(challengeID) == EventID(uuid.New()) {
		t.Fatal("EventID collided for different challenges")
	}
}

func TestValidateCommandRejectsPlainInvalidPayload(t *testing.T) {
	if err := ValidateCommand(Command{SchemaVersion: 1}); err == nil {
		t.Fatal("ValidateCommand accepted missing identifiers")
	}
}
