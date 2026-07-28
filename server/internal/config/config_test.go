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

func TestDomainReconciliationConfigParsesEnvironment(t *testing.T) {
	t.Setenv("DOMAIN_RECONCILIATION_POLL_INTERVAL", "45s")
	t.Setenv("DOMAIN_RECONCILIATION_BATCH_SIZE", "40")
	t.Setenv("DOMAIN_RECONCILIATION_CONCURRENCY", "8")
	t.Setenv("DOMAIN_RECONCILIATION_LOCK_TIMEOUT", "3m")
	t.Setenv("DOMAIN_RECONCILIATION_CHECK_TIMEOUT", "25s")
	t.Setenv("DOMAIN_RECONCILIATION_HEALTH_CHECK_INTERVAL", "12h")
	t.Setenv("DOMAIN_RECONCILIATION_HEALTH_RETRY_INTERVAL", "30m")
	t.Setenv("DOMAIN_RECONCILIATION_HEALTH_FAILURE_THRESHOLD", "4")
	var parsed struct {
		DomainReconciliation DomainReconciliationConfig `envPrefix:"DOMAIN_RECONCILIATION_"`
	}
	if err := env.Parse(&parsed); err != nil {
		t.Fatalf("parse domain reconciliation configuration: %v", err)
	}
	want := DomainReconciliationConfig{PollInterval: 45 * time.Second, BatchSize: 40, Concurrency: 8, LockTimeout: 3 * time.Minute, CheckTimeout: 25 * time.Second, HealthCheckInterval: 12 * time.Hour, HealthRetryInterval: 30 * time.Minute, HealthFailureThreshold: 4}
	if parsed.DomainReconciliation != want {
		t.Fatalf("DomainReconciliation = %+v, want %+v", parsed.DomainReconciliation, want)
	}
}

func TestNormalizeDomainReconciliationDefaults(t *testing.T) {
	cfg := Config{}
	cfg.normalize()
	want := DomainReconciliationConfig{PollInterval: 30 * time.Second, BatchSize: 25, Concurrency: 5, LockTimeout: 2 * time.Minute, CheckTimeout: 20 * time.Second, HealthCheckInterval: 24 * time.Hour, HealthRetryInterval: time.Hour, HealthFailureThreshold: 3}
	if cfg.DomainReconciliation != want {
		t.Fatalf("DomainReconciliation = %+v, want %+v", cfg.DomainReconciliation, want)
	}
}

func TestNormalizeWorkerHTTPPort(t *testing.T) {
	cfg := Config{Worker: WorkerConfig{HTTPPort: " 9090 "}}
	cfg.normalize()
	if cfg.Worker.HTTPPort != "9090" {
		t.Fatalf("Worker.HTTPPort = %q, want 9090", cfg.Worker.HTTPPort)
	}
}
