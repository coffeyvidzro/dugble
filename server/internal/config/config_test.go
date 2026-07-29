package config

import (
	"testing"
	"time"
)

func TestIdentityAIConfigValidation(t *testing.T) {
	t.Parallel()
	valid := IdentityAIConfig{
		Enabled: true,
		BaseURL: "http://identity-ai:8000",
		APIKey:  "internal-secret",
		Timeout: 5 * time.Second,
	}
	if err := valid.Validate(); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}

	tests := []struct {
		name   string
		mutate func(*IdentityAIConfig)
	}{
		{"missing URL", func(value *IdentityAIConfig) { value.BaseURL = "" }},
		{"relative URL", func(value *IdentityAIConfig) { value.BaseURL = "/identity-ai" }},
		{"URL credentials", func(value *IdentityAIConfig) { value.BaseURL = "http://user:pass@identity-ai:8000" }},
		{"missing API key", func(value *IdentityAIConfig) { value.APIKey = "" }},
		{"invalid timeout", func(value *IdentityAIConfig) { value.Timeout = 0 }},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			candidate := valid
			test.mutate(&candidate)
			if err := candidate.Validate(); err == nil {
				t.Fatal("Validate() accepted invalid configuration")
			}
		})
	}
}

func TestDisabledIdentityAIConfigDoesNotRequireCredentials(t *testing.T) {
	t.Parallel()
	if err := (IdentityAIConfig{}).Validate(); err != nil {
		t.Fatalf("Validate() error = %v", err)
	}
}
