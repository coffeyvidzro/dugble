package dispatch

import (
	"bytes"
	"encoding/json"
	"testing"

	"github.com/google/uuid"
)

func TestNewEventIsDeterministicAndEncrypted(t *testing.T) {
	command := Command{
		VerificationID: uuid.New(), ChallengeID: uuid.New(), TeamID: uuid.New(),
		EncryptedCode: []byte("ciphertext"), SchemaVersion: 1,
	}
	first, err := NewEvent(command)
	if err != nil {
		t.Fatalf("NewEvent() error = %v", err)
	}
	second, err := NewEvent(command)
	if err != nil {
		t.Fatalf("NewEvent() replay error = %v", err)
	}
	if first.ID != second.ID {
		t.Fatalf("event IDs differ: %s != %s", first.ID, second.ID)
	}
	if first.Subject != Subject || first.AggregateID != command.ChallengeID {
		t.Fatalf("NewEvent() = %+v", first)
	}
	if bytes.Contains(first.Payload, []byte(`"code"`)) {
		t.Fatal("dispatch payload contains a plaintext code field")
	}
	var decoded Command
	if err := json.Unmarshal(first.Payload, &decoded); err != nil {
		t.Fatalf("decode event payload: %v", err)
	}
	if !bytes.Equal(decoded.EncryptedCode, command.EncryptedCode) {
		t.Fatal("dispatch payload did not preserve encrypted code")
	}
}
