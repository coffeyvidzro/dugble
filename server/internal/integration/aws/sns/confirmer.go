package sns

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	defaultConfirmationTimeout   = 5 * time.Second
	maxConfirmationResponseBytes = 64 << 10
)

type ConfirmSubscriptionInput struct {
	TopicARN string
	Token    string
}

type ConfirmSubscriptionClient interface {
	ConfirmSubscription(context.Context, ConfirmSubscriptionInput) error
}

type SubscriptionConfirmer interface {
	Confirm(context.Context, Envelope) error
}

type Confirmer struct {
	client ConfirmSubscriptionClient
}

type HTTPConfirmSubscriptionClient struct {
	client *http.Client
}

func NewConfirmer(client ConfirmSubscriptionClient) *Confirmer {
	return &Confirmer{client: client}
}

func NewHTTPConfirmSubscriptionClient(client *http.Client) *HTTPConfirmSubscriptionClient {
	configured := http.Client{}
	if client != nil {
		configured = *client
	}
	if configured.Timeout <= 0 {
		configured.Timeout = defaultConfirmationTimeout
	}
	configured.CheckRedirect = func(_ *http.Request, _ []*http.Request) error {
		return http.ErrUseLastResponse
	}
	return &HTTPConfirmSubscriptionClient{client: &configured}
}

func (c *Confirmer) Confirm(ctx context.Context, envelope Envelope) error {
	if envelope.Type != TypeSubscriptionConfirmation {
		return fmt.Errorf("%w: expected %s, got %s", ErrInvalidEnvelope, TypeSubscriptionConfirmation, envelope.Type)
	}
	if err := validateEnvelope(envelope); err != nil {
		return err
	}
	if c == nil || c.client == nil {
		return fmt.Errorf("%w: confirmation client is not configured", ErrConfirmationUnavailable)
	}
	if err := c.client.ConfirmSubscription(ctx, ConfirmSubscriptionInput{
		TopicARN: envelope.TopicARN,
		Token:    *envelope.Token,
	}); err != nil {
		return fmt.Errorf("%w: %w", ErrConfirmationUnavailable, err)
	}
	return nil
}

func (c *HTTPConfirmSubscriptionClient) ConfirmSubscription(ctx context.Context, input ConfirmSubscriptionInput) error {
	if c == nil || c.client == nil {
		return fmt.Errorf("%w: HTTP client is not configured", ErrConfirmationUnavailable)
	}

	endpoint, err := confirmationEndpoint(input)
	if err != nil {
		return err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, http.NoBody)
	if err != nil {
		return fmt.Errorf("%w: create request: %w", ErrConfirmationUnavailable, err)
	}
	request.Header.Set("Accept", "application/xml")

	response, err := c.client.Do(request)
	if err != nil {
		return fmt.Errorf("%w: send request: %w", ErrConfirmationUnavailable, err)
	}
	defer func() { _ = response.Body.Close() }()
	_, _ = io.Copy(io.Discard, io.LimitReader(response.Body, maxConfirmationResponseBytes))

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("%w: unexpected HTTP status %d", ErrConfirmationUnavailable, response.StatusCode)
	}
	return nil
}

func confirmationEndpoint(input ConfirmSubscriptionInput) (string, error) {
	topicARN := strings.TrimSpace(input.TopicARN)
	token := strings.TrimSpace(input.Token)
	if topicARN == "" || token == "" {
		return "", fmt.Errorf("%w: topic ARN and token are required", ErrInvalidEnvelope)
	}

	parts := strings.SplitN(topicARN, ":", 6)
	if len(parts) != 6 || parts[0] != "arn" || parts[2] != "sns" || parts[3] == "" || parts[4] == "" || parts[5] == "" {
		return "", fmt.Errorf("%w: invalid SNS topic ARN", ErrInvalidEnvelope)
	}
	if !isDNSLabel(parts[3]) {
		return "", fmt.Errorf("%w: invalid SNS region", ErrInvalidEnvelope)
	}

	hostSuffix := ""
	switch parts[1] {
	case "aws", "aws-us-gov":
		hostSuffix = "amazonaws.com"
	case "aws-cn":
		hostSuffix = "amazonaws.com.cn"
	default:
		return "", fmt.Errorf("%w: unsupported AWS partition %q", ErrInvalidEnvelope, parts[1])
	}

	endpoint := url.URL{
		Scheme: "https",
		Host:   "sns." + parts[3] + "." + hostSuffix,
		Path:   "/",
	}
	query := endpoint.Query()
	query.Set("Action", "ConfirmSubscription")
	query.Set("TopicArn", topicARN)
	query.Set("Token", token)
	query.Set("Version", "2010-03-31")
	endpoint.RawQuery = query.Encode()
	return endpoint.String(), nil
}
