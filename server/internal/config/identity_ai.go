package config

import (
	"os"
	"strings"
	"time"
)

const defaultIdentityAITimeout = 30 * time.Second

type IdentityAIConfig struct {
	BaseURL string
	APIKey  string
	Timeout time.Duration
}

func (c *Config) IdentityAI() IdentityAIConfig {
	return IdentityAIConfig{
		BaseURL: strings.TrimRight(strings.TrimSpace(os.Getenv("IDENTITY_AI_BASE_URL")), "/"),
		APIKey:  strings.TrimSpace(os.Getenv("IDENTITY_AI_API_KEY")),
		Timeout: defaultIdentityAITimeout,
	}
}
