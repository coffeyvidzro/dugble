package inbox

import (
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestRecipientTokenRoundTrip(t *testing.T) {
	manager, err := NewRecipientTokenManager(strings.Repeat("a", 32))
	if err != nil {
		t.Fatalf("NewRecipientTokenManager() error = %v", err)
	}
	now := time.Date(2026, 8, 4, 12, 0, 0, 0, time.UTC)
	manager.now = func() time.Time { return now }
	teamID := uuid.New()
	token, expiresAt, err := manager.Mint(teamID, "Customer-42", 15*time.Minute)
	if err != nil {
		t.Fatalf("Mint() error = %v", err)
	}
	access, err := manager.Parse(token)
	if err != nil {
		t.Fatalf("Parse() error = %v", err)
	}
	if access.TeamID != teamID || access.RecipientID != "Customer-42" {
		t.Fatalf("Parse() access = %+v", access)
	}
	if !access.ExpiresAt.Equal(expiresAt) {
		t.Fatalf("Parse() expiry = %v, want %v", access.ExpiresAt, expiresAt)
	}
}

func TestRecipientTokenRejectsTamperingAndExpiry(t *testing.T) {
	manager, err := NewRecipientTokenManager(strings.Repeat("b", 32))
	if err != nil {
		t.Fatalf("NewRecipientTokenManager() error = %v", err)
	}
	now := time.Date(2026, 8, 4, 12, 0, 0, 0, time.UTC)
	manager.now = func() time.Time { return now }
	token, _, err := manager.Mint(uuid.New(), "recipient", time.Minute)
	if err != nil {
		t.Fatalf("Mint() error = %v", err)
	}
	if _, err := manager.Parse(token + "x"); err == nil {
		t.Fatal("Parse() accepted a tampered token")
	}
	manager.now = func() time.Time { return now.Add(2 * time.Minute) }
	if _, err := manager.Parse(token); err == nil {
		t.Fatal("Parse() accepted an expired token")
	}
}

func TestRecipientCursorRoundTrip(t *testing.T) {
	cursor := encodeRecipientCursor(75)
	offset, err := decodeRecipientCursor(cursor)
	if err != nil {
		t.Fatalf("decodeRecipientCursor() error = %v", err)
	}
	if offset != 75 {
		t.Fatalf("decodeRecipientCursor() = %d, want 75", offset)
	}
	if _, err := decodeRecipientCursor("not-base64!"); err == nil {
		t.Fatal("decodeRecipientCursor() accepted an invalid cursor")
	}
}

func TestRecipientTokenRequiresStrongSecret(t *testing.T) {
	if _, err := NewRecipientTokenManager("too-short"); err == nil {
		t.Fatal("NewRecipientTokenManager() accepted a short secret")
	}
}
