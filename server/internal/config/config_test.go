package config

import (
	"strings"
	"testing"
	"time"

	"github.com/caarlos0/env/v11"
)

func TestWebhookDeliveryConfigParsesEnvironment(t *testing.T) {
	t.Setenv("WEBHOOK_DELIVERY_POLL_INTERVAL", "2s")
	t.Setenv("WEBHOOK_DELIVERY_BATCH_SIZE", "75")
	t.Setenv("WEBHOOK_DELIVERY_CONCURRENCY", "12")
	t.Setenv("WEBHOOK_DELIVERY_LOCK_TIMEOUT", "45s")
	t.Setenv("WEBHOOK_DELIVERY_HANDLE_TIMEOUT", "20s")
	t.Setenv("WEBHOOK_DELIVERY_HTTP_TIMEOUT", "18s")
	t.Setenv("WEBHOOK_DELIVERY_AUTO_DISABLE_AFTER", "12")

	var parsed struct {
		WebhookDelivery WebhookDeliveryConfig `envPrefix:"WEBHOOK_DELIVERY_"`
	}
	if err := env.Parse(&parsed); err != nil {
		t.Fatalf("parse webhook delivery configuration: %v", err)
	}

	want := WebhookDeliveryConfig{
		PollInterval:     2 * time.Second,
		BatchSize:        75,
		Concurrency:      12,
		LockTimeout:      45 * time.Second,
		HandleTimeout:    20 * time.Second,
		HTTPTimeout:      18 * time.Second,
		AutoDisableAfter: 12,
	}
	if parsed.WebhookDelivery != want {
		t.Fatalf("WebhookDelivery = %+v, want %+v", parsed.WebhookDelivery, want)
	}
}

func TestIdentityConfigurationParsesEnvironment(t *testing.T) {
	t.Setenv("IDENTITY_AI_ENABLED", "true")
	t.Setenv("IDENTITY_AI_BASE_URL", "http://identity-ai:8000/")
	t.Setenv("IDENTITY_AI_API_KEY", "internal-key")
	t.Setenv("IDENTITY_AI_GUIDANCE_TIMEOUT", "4s")
	t.Setenv("IDENTITY_AI_ANALYSIS_TIMEOUT", "40s")
	t.Setenv("IDENTITY_AI_MAX_RESPONSE_SIZE", "2097152")
	t.Setenv("IDENTITY_VERIFICATION_TTL", "8m")
	t.Setenv("IDENTITY_CAPTURE_TOKEN_TTL", "90s")
	t.Setenv("IDENTITY_MAX_ATTEMPTS", "4")
	t.Setenv("IDENTITY_POLICY_VERSION", "identity-v2")
	t.Setenv("IDENTITY_ATTACK_THRESHOLD", "0.7")
	t.Setenv("IDENTITY_FACE_SIMILARITY_THRESHOLD", "0.65")

	var parsed struct {
		IdentityAI IdentityAIConfig `envPrefix:"IDENTITY_AI_"`
		Identity   IdentityConfig   `envPrefix:"IDENTITY_"`
	}
	if err := env.Parse(&parsed); err != nil {
		t.Fatalf("parse identity configuration: %v", err)
	}

	if !parsed.IdentityAI.Enabled || parsed.IdentityAI.AnalysisTimeout != 40*time.Second {
		t.Fatalf("IdentityAI = %+v", parsed.IdentityAI)
	}
	if parsed.Identity.MaxAttempts != 4 || parsed.Identity.PolicyVersion != "identity-v2" {
		t.Fatalf("Identity = %+v", parsed.Identity)
	}
}

func TestNormalizeIdentityDefaults(t *testing.T) {
	cfg := Config{}

	cfg.normalize()

	if cfg.IdentityAI.GuidanceTimeout != 3*time.Second {
		t.Errorf("IdentityAI.GuidanceTimeout = %v, want 3s", cfg.IdentityAI.GuidanceTimeout)
	}
	if cfg.IdentityAI.AnalysisTimeout != 30*time.Second {
		t.Errorf("IdentityAI.AnalysisTimeout = %v, want 30s", cfg.IdentityAI.AnalysisTimeout)
	}
	if cfg.Identity.VerificationTTL != 5*time.Minute || cfg.Identity.MaxAttempts != 3 {
		t.Errorf("Identity = %+v", cfg.Identity)
	}
	if cfg.Identity.AttackThreshold != 0.6 || cfg.Identity.FaceSimilarityThreshold != 0.6 {
		t.Errorf("Identity thresholds = %+v", cfg.Identity)
	}
}

func TestIdentityAIValidationRequiresPrivateClientSettingsWhenEnabled(t *testing.T) {
	cfg := Config{IdentityAI: IdentityAIConfig{Enabled: true}}
	cfg.normalize()

	err := cfg.validateIdentity()
	if err == nil || !strings.Contains(err.Error(), "IDENTITY_AI_BASE_URL") {
		t.Fatalf("validateIdentity() error = %v", err)
	}

	cfg.IdentityAI.BaseURL = "http://identity-ai:8000"
	err = cfg.validateIdentity()
	if err == nil || !strings.Contains(err.Error(), "IDENTITY_AI_API_KEY") {
		t.Fatalf("validateIdentity() error = %v", err)
	}

	cfg.IdentityAI.APIKey = "secret"
	if err := cfg.validateIdentity(); err != nil {
		t.Fatalf("validateIdentity() error = %v", err)
	}
}

func TestIdentityValidationRejectsUnsafePolicyThreshold(t *testing.T) {
	cfg := Config{Identity: IdentityConfig{AttackThreshold: 1.2}}
	cfg.normalize()

	err := cfg.validateIdentity()
	if err == nil || !strings.Contains(err.Error(), "IDENTITY_ATTACK_THRESHOLD") {
		t.Fatalf("validateIdentity() error = %v", err)
	}
}

func TestNormalizeWebhookDeliveryDefaults(t *testing.T) {
	cfg := Config{}

	cfg.normalize()

	if cfg.WebhookDelivery.PollInterval != 500*time.Millisecond {
		t.Errorf("WebhookDelivery.PollInterval = %v, want 500ms", cfg.WebhookDelivery.PollInterval)
	}
	if cfg.WebhookDelivery.BatchSize != 50 {
		t.Errorf("WebhookDelivery.BatchSize = %d, want 50", cfg.WebhookDelivery.BatchSize)
	}
	if cfg.WebhookDelivery.Concurrency != 10 {
		t.Errorf("WebhookDelivery.Concurrency = %d, want 10", cfg.WebhookDelivery.Concurrency)
	}
	if cfg.WebhookDelivery.LockTimeout != 30*time.Second {
		t.Errorf("WebhookDelivery.LockTimeout = %v, want 30s", cfg.WebhookDelivery.LockTimeout)
	}
	if cfg.WebhookDelivery.HandleTimeout != 15*time.Second {
		t.Errorf("WebhookDelivery.HandleTimeout = %v, want 15s", cfg.WebhookDelivery.HandleTimeout)
	}
	if cfg.WebhookDelivery.HTTPTimeout != 10*time.Second {
		t.Errorf("WebhookDelivery.HTTPTimeout = %v, want 10s", cfg.WebhookDelivery.HTTPTimeout)
	}
	if cfg.WebhookDelivery.AutoDisableAfter != 20 {
		t.Errorf("WebhookDelivery.AutoDisableAfter = %d, want 20", cfg.WebhookDelivery.AutoDisableAfter)
	}
}

func TestNormalizeWebhookDeliveryPreservesPositiveValues(t *testing.T) {
	want := WebhookDeliveryConfig{
		PollInterval:     time.Second,
		BatchSize:        25,
		Concurrency:      5,
		LockTimeout:      time.Minute,
		HandleTimeout:    20 * time.Second,
		HTTPTimeout:      12 * time.Second,
		AutoDisableAfter: 8,
	}
	cfg := Config{WebhookDelivery: want}

	cfg.normalize()

	if cfg.WebhookDelivery != want {
		t.Fatalf("WebhookDelivery = %+v, want %+v", cfg.WebhookDelivery, want)
	}
}
