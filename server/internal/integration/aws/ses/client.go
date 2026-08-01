package ses

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	awsses "github.com/aws/aws-sdk-go-v2/service/ses"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
)

// NewClient creates an SES client using the AWS SDK default credential chain.
// Deployments outside AWS may pass a tightly scoped access-key pair from their
// secret manager. AWS-hosted deployments may leave both values empty and use a
// workload role.
func NewClient(region, defaultFrom, accessKey, secretKey string) (*Client, error) {
	return newClient(context.Background(), region, defaultFrom, accessKey, secretKey)
}

func NewSESSender(ctx context.Context, region, defaultFrom, accessKey, secretKey string) (*Client, error) {
	return newClient(ctx, region, defaultFrom, accessKey, secretKey)
}

func newClient(ctx context.Context, region, defaultFrom, accessKey, secretKey string) (*Client, error) {
	region = strings.TrimSpace(region)
	accessKey = strings.TrimSpace(accessKey)
	secretKey = strings.TrimSpace(secretKey)
	if region == "" {
		return nil, errors.New("SES region is required")
	}
	if (accessKey == "") != (secretKey == "") {
		return nil, errors.New("AWS access key and secret key must be configured together")
	}

	options := []func(*awsconfig.LoadOptions) error{awsconfig.WithRegion(region)}
	if accessKey != "" {
		options = append(options, awsconfig.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""),
		))
	}
	resolved, err := awsconfig.LoadDefaultConfig(ctx, options...)
	if err != nil {
		return nil, fmt.Errorf("load AWS configuration: %w", err)
	}
	return &Client{
		defaultRegion:   region,
		defaultFrom:     strings.TrimSpace(defaultFrom),
		awsConfig:       resolved,
		sendingClients:  make(map[string]sesAPI),
		identityClients: make(map[string]sesIdentityAPI),
	}, nil
}

func (c *Client) regionalConfig(region string) aws.Config {
	config := c.awsConfig
	config.Region = strings.TrimSpace(region)
	return config
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
	client := awsses.NewFromConfig(c.regionalConfig(region))
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
	client := sesv2.NewFromConfig(c.regionalConfig(region))
	c.identityClients[region] = client
	return client, nil
}
