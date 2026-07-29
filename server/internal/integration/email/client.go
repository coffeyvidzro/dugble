package email

import (
	"context"
	"errors"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
)

func NewClient(region, defaultFrom, accessKey, secretKey string, configurationSet ...string) (*Client, error) {
	region = strings.TrimSpace(region)
	accessKey = strings.TrimSpace(accessKey)
	secretKey = strings.TrimSpace(secretKey)
	if region == "" {
		return nil, errors.New("SES region is required")
	}
	if accessKey == "" || secretKey == "" {
		return nil, errors.New("SES credentials are required")
	}
	return &Client{
		defaultRegion:    region,
		defaultFrom:      strings.TrimSpace(defaultFrom),
		accessKey:        accessKey,
		secretKey:        secretKey,
		configurationSet: firstTrimmed(configurationSet),
		sendingClients:   make(map[string]sesAPI),
		identityClients:  make(map[string]sesIdentityAPI),
	}, nil
}

func firstTrimmed(values []string) string {
	if len(values) == 0 {
		return ""
	}
	return strings.TrimSpace(values[0])
}

// NewSESSender preserves the existing constructor used by the server and worker.
func NewSESSender(_ context.Context, region, defaultFrom, accessKey, secretKey string, configurationSet ...string) (*Client, error) {
	return NewClient(region, defaultFrom, accessKey, secretKey, configurationSet...)
}

func (c *Client) awsConfig(region string) aws.Config {
	return aws.Config{
		Region:      strings.TrimSpace(region),
		Credentials: credentials.NewStaticCredentialsProvider(c.accessKey, c.secretKey, ""),
	}
}

func (c *Client) sendingClient(region string) (sesAPI, error) {
	if c == nil {
		return nil, errors.New("SES client is not configured")
	}
	region = strings.TrimSpace(region)
	if region == "" {
		region = c.defaultRegion
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if client, ok := c.sendingClients[region]; ok {
		return client, nil
	}
	client := ses.NewFromConfig(c.awsConfig(region))
	c.sendingClients[region] = client
	return client, nil
}

func (c *Client) identityClient(region string) (sesIdentityAPI, error) {
	if c == nil {
		return nil, errors.New("SES client is not configured")
	}
	region = strings.TrimSpace(region)
	if region == "" {
		region = c.defaultRegion
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if client, ok := c.identityClients[region]; ok {
		return client, nil
	}
	client := sesv2.NewFromConfig(c.awsConfig(region))
	c.identityClients[region] = client
	return client, nil
}
