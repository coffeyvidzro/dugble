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
	first := hash("state")
	second := hash("state")
	if first != second {
		t.Fatal("hash should be stable")
	}
	if first == "state" {
		t.Fatal("state must not be stored in plaintext")
	}
}
