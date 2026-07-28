package config

import (
	"errors"
	"math"
	"net/url"
	"strings"
	"time"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type ProviderConfig struct {
	BaseURL string `env:"BASE_URL"`
	APIKey  string `env:"API_KEY"`
}

type HubtelConfig struct {
	APIID          string `env:"API_ID"`
	APIKey         string `env:"API_KEY"`
	MerchantNumber string `env:"MERCHANT_NUMBER"`
}

type AWSConfig struct {
	FromEmail string `env:"FROM_EMAIL,required,notEmpty"`
	Region    string `env:"REGION,required,notEmpty"`
	AccessKey string `env:"ACCESS_KEY_ID,required,notEmpty"`
	SecretKey string `env:"SECRET_ACCESS_KEY,required,notEmpty"`
}

type MessagingConfig struct {
	URL                      string        `env:"URL" envDefault:"nats://localhost:4222"`
	OutboxPollInterval       time.Duration `env:"OUTBOX_POLL_INTERVAL" envDefault:"500ms"`
	OutboxBatchSize          int           `env:"OUTBOX_BATCH_SIZE" envDefault:"100"`
	OutboxLockTimeout        time.Duration `env:"OUTBOX_LOCK_TIMEOUT" envDefault:"30s"`
	SMSConsumerConcurrency   int           `env:"SMS_CONSUMER_CONCURRENCY" envDefault:"10"`
	SMSConsumerAckWait       time.Duration `env:"SMS_CONSUMER_ACK_WAIT" envDefault:"2m"`
	SMSConsumerMaxDeliver    int           `env:"SMS_CONSUMER_MAX_DELIVER" envDefault:"6"`
	SMSHandlerTimeout        time.Duration `env:"SMS_HANDLER_TIMEOUT" envDefault:"45s"`
	EmailConsumerConcurrency int           `env:"EMAIL_CONSUMER_CONCURRENCY" envDefault:"5"`
	EmailConsumerAckWait     time.Duration `env:"EMAIL_CONSUMER_ACK_WAIT" envDefault:"2m"`
	EmailConsumerMaxDeliver  int           `env:"EMAIL_CONSUMER_MAX_DELIVER" envDefault:"6"`
	EmailHandlerTimeout      time.Duration `env:"EMAIL_HANDLER_TIMEOUT" envDefault:"45s"`
}

type WebhookDeliveryConfig struct {
	PollInterval     time.Duration `env:"POLL_INTERVAL" envDefault:"500ms"`
	BatchSize        int32         `env:"BATCH_SIZE" envDefault:"50"`
	Concurrency      int           `env:"CONCURRENCY" envDefault:"10"`
	LockTimeout      time.Duration `env:"LOCK_TIMEOUT" envDefault:"30s"`
	HandleTimeout    time.Duration `env:"HANDLE_TIMEOUT" envDefault:"15s"`
	HTTPTimeout      time.Duration `env:"HTTP_TIMEOUT" envDefault:"10s"`
	AutoDisableAfter int32         `env:"AUTO_DISABLE_AFTER" envDefault:"20"`
}

type BackofficeConfig struct {
	HTTPPort    string   `env:"HTTP_PORT" envDefault:"8081"`
	AdminEmails []string `env:"ADMIN_EMAILS" envSeparator:","`
}

type IdentityAIConfig struct {
	Enabled         bool          `env:"ENABLED" envDefault:"false"`
	BaseURL         string        `env:"BASE_URL"`
	APIKey          string        `env:"API_KEY"`
	GuidanceTimeout time.Duration `env:"GUIDANCE_TIMEOUT" envDefault:"3s"`
	AnalysisTimeout time.Duration `env:"ANALYSIS_TIMEOUT" envDefault:"30s"`
	MaxResponseSize int64         `env:"MAX_RESPONSE_SIZE" envDefault:"1048576"`
}

type IdentityConfig struct {
	VerificationTTL         time.Duration `env:"VERIFICATION_TTL" envDefault:"5m"`
	CaptureTokenTTL         time.Duration `env:"CAPTURE_TOKEN_TTL" envDefault:"2m"`
	MaxAttempts             int32         `env:"MAX_ATTEMPTS" envDefault:"3"`
	PolicyVersion           string        `env:"POLICY_VERSION" envDefault:"identity-default-v1"`
	AttackThreshold         float64       `env:"ATTACK_THRESHOLD" envDefault:"0.6"`
	FaceSimilarityThreshold float64       `env:"FACE_SIMILARITY_THRESHOLD" envDefault:"0.6"`
}

type Config struct {
	AppEnv          string                `env:"APP_ENV"   envDefault:"development"`
	HTTPPort        string                `env:"HTTP_PORT" envDefault:"8080"`
	DatabaseURL     string                `env:"DATABASE_URL,required,notEmpty"`
	RedisURL        string                `env:"REDIS_URL" envDefault:"redis://localhost:6379/0"`
	CORSOrigins     []string              `env:"CORS_ORIGINS" envSeparator:"," envDefault:"http://localhost:3000,http://127.0.0.1:3000"`
	ArcjetKey       string                `env:"ARCJET_KEY,required,notEmpty"`
	FrontendURL     string                `env:"FRONTEND_URL" envDefault:"http://localhost:3000"`
	BackendURL      string                `env:"BACKEND_URL"  envDefault:"http://localhost:8080"`
	CookieDomain    string                `env:"COOKIE_DOMAIN"`
	AWS             AWSConfig             `envPrefix:"AWS_"`
	Messaging       MessagingConfig       `envPrefix:"NATS_"`
	WebhookDelivery WebhookDeliveryConfig `envPrefix:"WEBHOOK_DELIVERY_"`
	Arkesel         ProviderConfig        `envPrefix:"ARKESEL_"`
	MNotify         ProviderConfig        `envPrefix:"MNOTIFY_"`
	Hubtel          HubtelConfig          `envPrefix:"HUBTEL_"`
	Backoffice      BackofficeConfig      `envPrefix:"BACKOFFICE_"`
	IdentityAI      IdentityAIConfig      `envPrefix:"IDENTITY_AI_"`
	Identity        IdentityConfig        `envPrefix:"IDENTITY_"`
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}

	cfg.normalize()
	if err := cfg.validateIdentity(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *Config) IsDevelopment() bool {
	return strings.EqualFold(c.AppEnv, "development")
}

func (c *Config) normalize() {
	c.AppEnv = strings.TrimSpace(c.AppEnv)
	c.HTTPPort = strings.TrimSpace(c.HTTPPort)
	c.DatabaseURL = strings.TrimSpace(c.DatabaseURL)
	c.RedisURL = strings.TrimSpace(c.RedisURL)
	c.ArcjetKey = strings.TrimSpace(c.ArcjetKey)
	c.FrontendURL = strings.TrimRight(strings.TrimSpace(c.FrontendURL), "/")
	c.BackendURL = strings.TrimRight(strings.TrimSpace(c.BackendURL), "/")
	c.CookieDomain = strings.TrimSpace(c.CookieDomain)
	c.AWS.FromEmail = strings.TrimSpace(c.AWS.FromEmail)
	c.AWS.Region = strings.TrimSpace(c.AWS.Region)
	c.AWS.AccessKey = strings.TrimSpace(c.AWS.AccessKey)
	c.AWS.SecretKey = strings.TrimSpace(c.AWS.SecretKey)
	c.Messaging.URL = strings.TrimSpace(c.Messaging.URL)
	if c.Messaging.OutboxPollInterval <= 0 {
		c.Messaging.OutboxPollInterval = 500 * time.Millisecond
	}
	if c.Messaging.OutboxBatchSize <= 0 {
		c.Messaging.OutboxBatchSize = 100
	}
	if c.Messaging.OutboxLockTimeout <= 0 {
		c.Messaging.OutboxLockTimeout = 30 * time.Second
	}
	if c.Messaging.SMSConsumerConcurrency <= 0 {
		c.Messaging.SMSConsumerConcurrency = 10
	}
	if c.Messaging.SMSConsumerAckWait <= 0 {
		c.Messaging.SMSConsumerAckWait = 2 * time.Minute
	}
	if c.Messaging.SMSConsumerMaxDeliver <= 0 {
		c.Messaging.SMSConsumerMaxDeliver = 6
	}
	if c.Messaging.SMSHandlerTimeout <= 0 {
		c.Messaging.SMSHandlerTimeout = 45 * time.Second
	}
	if c.Messaging.EmailConsumerConcurrency <= 0 {
		c.Messaging.EmailConsumerConcurrency = 5
	}
	if c.Messaging.EmailConsumerAckWait <= 0 {
		c.Messaging.EmailConsumerAckWait = 2 * time.Minute
	}
	if c.Messaging.EmailConsumerMaxDeliver <= 0 {
		c.Messaging.EmailConsumerMaxDeliver = 6
	}
	if c.Messaging.EmailHandlerTimeout <= 0 {
		c.Messaging.EmailHandlerTimeout = 45 * time.Second
	}
	if c.WebhookDelivery.PollInterval <= 0 {
		c.WebhookDelivery.PollInterval = 500 * time.Millisecond
	}
	if c.WebhookDelivery.BatchSize <= 0 {
		c.WebhookDelivery.BatchSize = 50
	}
	if c.WebhookDelivery.Concurrency <= 0 {
		c.WebhookDelivery.Concurrency = 10
	}
	if c.WebhookDelivery.LockTimeout <= 0 {
		c.WebhookDelivery.LockTimeout = 30 * time.Second
	}
	if c.WebhookDelivery.HandleTimeout <= 0 {
		c.WebhookDelivery.HandleTimeout = 15 * time.Second
	}
	if c.WebhookDelivery.HTTPTimeout <= 0 {
		c.WebhookDelivery.HTTPTimeout = 10 * time.Second
	}
	if c.WebhookDelivery.AutoDisableAfter <= 0 {
		c.WebhookDelivery.AutoDisableAfter = 20
	}
	c.Arkesel.APIKey = strings.TrimSpace(c.Arkesel.APIKey)
	c.Arkesel.BaseURL = strings.TrimRight(strings.TrimSpace(c.Arkesel.BaseURL), "/")
	c.MNotify.APIKey = strings.TrimSpace(c.MNotify.APIKey)
	c.MNotify.BaseURL = strings.TrimRight(strings.TrimSpace(c.MNotify.BaseURL), "/")
	c.Hubtel.APIID = strings.TrimSpace(c.Hubtel.APIID)
	c.Hubtel.APIKey = strings.TrimSpace(c.Hubtel.APIKey)
	c.Hubtel.MerchantNumber = strings.TrimSpace(c.Hubtel.MerchantNumber)
	c.Backoffice.HTTPPort = strings.TrimSpace(c.Backoffice.HTTPPort)
	c.IdentityAI.BaseURL = strings.TrimRight(strings.TrimSpace(c.IdentityAI.BaseURL), "/")
	c.IdentityAI.APIKey = strings.TrimSpace(c.IdentityAI.APIKey)
	c.Identity.PolicyVersion = strings.TrimSpace(c.Identity.PolicyVersion)
	if c.IdentityAI.GuidanceTimeout <= 0 {
		c.IdentityAI.GuidanceTimeout = 3 * time.Second
	}
	if c.IdentityAI.AnalysisTimeout <= 0 {
		c.IdentityAI.AnalysisTimeout = 30 * time.Second
	}
	if c.IdentityAI.MaxResponseSize <= 0 {
		c.IdentityAI.MaxResponseSize = 1 << 20
	}
	if c.Identity.VerificationTTL <= 0 {
		c.Identity.VerificationTTL = 5 * time.Minute
	}
	if c.Identity.CaptureTokenTTL <= 0 {
		c.Identity.CaptureTokenTTL = 2 * time.Minute
	}
	if c.Identity.MaxAttempts <= 0 {
		c.Identity.MaxAttempts = 3
	}
	if c.Identity.PolicyVersion == "" {
		c.Identity.PolicyVersion = "identity-default-v1"
	}
	if c.Identity.AttackThreshold == 0 {
		c.Identity.AttackThreshold = 0.6
	}
	if c.Identity.FaceSimilarityThreshold == 0 {
		c.Identity.FaceSimilarityThreshold = 0.6
	}

	origins := make([]string, 0, len(c.CORSOrigins))
	for _, origin := range c.CORSOrigins {
		origin = strings.TrimSpace(origin)
		if origin == "" {
			continue
		}

		origins = append(origins, origin)
	}
	c.CORSOrigins = origins

	adminEmails := make([]string, 0, len(c.Backoffice.AdminEmails))
	for _, email := range c.Backoffice.AdminEmails {
		email = strings.ToLower(strings.TrimSpace(email))
		if email == "" {
			continue
		}

		adminEmails = append(adminEmails, email)
	}
	c.Backoffice.AdminEmails = adminEmails
}

func (c *Config) validateIdentity() error {
	if !finiteExclusiveUnit(c.Identity.AttackThreshold) {
		return errors.New("IDENTITY_ATTACK_THRESHOLD must be within 0..1")
	}
	if !finiteExclusiveUnit(c.Identity.FaceSimilarityThreshold) {
		return errors.New("IDENTITY_FACE_SIMILARITY_THRESHOLD must be within 0..1")
	}
	if !c.IdentityAI.Enabled {
		return nil
	}
	if c.IdentityAI.BaseURL == "" {
		return errors.New("IDENTITY_AI_BASE_URL is required when Identity AI is enabled")
	}
	parsed, err := url.Parse(c.IdentityAI.BaseURL)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return errors.New("IDENTITY_AI_BASE_URL must be an absolute HTTP or HTTPS URL")
	}
	if parsed.User != nil || parsed.RawQuery != "" || parsed.Fragment != "" {
		return errors.New("IDENTITY_AI_BASE_URL must not contain credentials, query, or fragment")
	}
	if c.IdentityAI.APIKey == "" {
		return errors.New("IDENTITY_AI_API_KEY is required when Identity AI is enabled")
	}
	return nil
}

func finiteExclusiveUnit(value float64) bool {
	return !math.IsNaN(value) && !math.IsInf(value, 0) && value > 0 && value < 1
}
