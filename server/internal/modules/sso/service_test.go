package sso

import "testing"

func TestDomainAllowed(t *testing.T) {
	t.Parallel()
	for _, tt := range []struct {
		email   string
		domains []string
		want    bool
	}{{"person@example.com", []string{"example.com"}, true}, {"person@sub.example.com", []string{"example.com"}, false}, {"person@attacker.com", []string{"example.com"}, false}, {"invalid", []string{"example.com"}, false}} {
		if got := domainAllowed(tt.email, tt.domains); got != tt.want {
			t.Errorf("domainAllowed(%q)=%v, want %v", tt.email, got, tt.want)
		}
	}
}
func TestStateHashIsStableAndOpaque(t *testing.T) {
	t.Parallel()
	if hash("state") != hash("state") {
		t.Fatal("hash should be stable")
	}
	if hash("state") == "state" {
		t.Fatal("state must not be stored in plaintext")
	}
}
