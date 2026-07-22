package config

import (
	"strings"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type ProviderConfig struct {
	BaseURL string `env:"BASE_URL"`
	APIKey  string `env:"API_KEY"`
}

type HubtelConfig struct {
	BaseURL               string `env:"BASE_URL"`
	TransactionStatusURL  string `env:"TRANSACTION_STATUS_URL"`
	APIID                 string `env:"API_ID"`
	APIKey                string `env:"API_KEY"`
	MerchantAccountNumber string `env:"MERCHANT_ACCOUNT_NUMBER"`
}

type AWSConfig struct {
	FromEmail string `env:"FROM_EMAIL,required,notEmpty"`
	Region    string `env:"REGION,required,notEmpty"`
	AccessKey string `env:"ACCESS_KEY_ID,required,notEmpty"`
	SecretKey string `env:"SECRET_ACCESS_KEY,required,notEmpty"`
}

type Config struct {
	AppEnv      string         `env:"APP_ENV"   envDefault:"development"`
	HTTPPort    string         `env:"HTTP_PORT" envDefault:"8080"`
	DatabaseURL string         `env:"DATABASE_URL,required,notEmpty"`
	RedisURL    string         `env:"REDIS_URL" envDefault:"redis://localhost:6379/0"`
	CORSOrigins []string       `env:"CORS_ORIGINS" envSeparator:"," envDefault:"http://localhost:3000,http://127.0.0.1:3000"`
	ArcjetKey   string         `env:"ARCJET_KEY,required,notEmpty"`
	FrontendURL string         `env:"FRONTEND_URL" envDefault:"http://localhost:3000"`
	BackendURL  string         `env:"BACKEND_URL"  envDefault:"http://localhost:8080"`
	AWS         AWSConfig      `envPrefix:"AWS_"`
	Arkesel     ProviderConfig `envPrefix:"ARKESEL_"`
	MNotify     ProviderConfig `envPrefix:"MNOTIFY_"`
	Hubtel      HubtelConfig   `envPrefix:"HUBTEL_"`
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}

	cfg.normalize()

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
	c.AWS.FromEmail = strings.TrimSpace(c.AWS.FromEmail)
	c.AWS.Region = strings.TrimSpace(c.AWS.Region)
	c.AWS.AccessKey = strings.TrimSpace(c.AWS.AccessKey)
	c.AWS.SecretKey = strings.TrimSpace(c.AWS.SecretKey)
	c.Arkesel.APIKey = strings.TrimSpace(c.Arkesel.APIKey)
	c.Arkesel.BaseURL = strings.TrimRight(strings.TrimSpace(c.Arkesel.BaseURL), "/")
	c.MNotify.APIKey = strings.TrimSpace(c.MNotify.APIKey)
	c.MNotify.BaseURL = strings.TrimRight(strings.TrimSpace(c.MNotify.BaseURL), "/")
	c.Hubtel.BaseURL = strings.TrimRight(strings.TrimSpace(c.Hubtel.BaseURL), "/")
	c.Hubtel.TransactionStatusURL = strings.TrimRight(strings.TrimSpace(c.Hubtel.TransactionStatusURL), "/")
	c.Hubtel.APIID = strings.TrimSpace(c.Hubtel.APIID)
	c.Hubtel.APIKey = strings.TrimSpace(c.Hubtel.APIKey)
	c.Hubtel.MerchantAccountNumber = strings.TrimSpace(c.Hubtel.MerchantAccountNumber)

	origins := make([]string, 0, len(c.CORSOrigins))
	for _, origin := range c.CORSOrigins {
		origin = strings.TrimSpace(origin)
		if origin == "" {
			continue
		}

		origins = append(origins, origin)
	}

	c.CORSOrigins = origins
}
