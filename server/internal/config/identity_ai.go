package config

import (
	"os"
	"strings"
	"time"
)

type IdentityAIConfig struct {
	BaseURL string
	APIKey  string
	Timeout time.Duration
}

func (c *Config) IdentityAI() IdentityAIConfig {
	timeout := 30 * time.Second
	if raw := strings.TrimSpace(os.Getenv("IDENTITY_AI_TIMEOUT")); raw != "" {
		if parsed, err := time.ParseDuration(raw); err == nil && parsed > 0 {
			timeout = parsed
		}
	}

	return IdentityAIConfig{
		BaseURL: strings.TrimRight(strings.TrimSpace(os.Getenv("IDENTITY_AI_BASE_URL")), "/"),
		APIKey:  strings.TrimSpace(os.Getenv("IDENTITY_AI_API_KEY")),
		Timeout: timeout,
	}
}
