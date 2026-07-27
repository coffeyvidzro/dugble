package config

import (
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

	var parsed struct {
		WebhookDelivery WebhookDeliveryConfig `envPrefix:"WEBHOOK_DELIVERY_"`
	}
	if err := env.Parse(&parsed); err != nil {
		t.Fatalf("parse webhook delivery configuration: %v", err)
	}

	want := WebhookDeliveryConfig{
		PollInterval:  2 * time.Second,
		BatchSize:     75,
		Concurrency:   12,
		LockTimeout:   45 * time.Second,
		HandleTimeout: 20 * time.Second,
		HTTPTimeout:   18 * time.Second,
	}
	if parsed.WebhookDelivery != want {
		t.Fatalf("WebhookDelivery = %+v, want %+v", parsed.WebhookDelivery, want)
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
}

func TestNormalizeWebhookDeliveryPreservesPositiveValues(t *testing.T) {
	want := WebhookDeliveryConfig{
		PollInterval:  time.Second,
		BatchSize:     25,
		Concurrency:   5,
		LockTimeout:   time.Minute,
		HandleTimeout: 20 * time.Second,
		HTTPTimeout:   12 * time.Second,
	}
	cfg := Config{WebhookDelivery: want}

	cfg.normalize()

	if cfg.WebhookDelivery != want {
		t.Fatalf("WebhookDelivery = %+v, want %+v", cfg.WebhookDelivery, want)
	}
}
