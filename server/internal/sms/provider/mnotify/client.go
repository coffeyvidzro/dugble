package mnotify

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/coffeyvidzro/dugble/server/internal/sms/provider"
)

const (
	ProviderName = "mnotify_bms"
	DefaultURL   = "https://apps.mnotify.net/smsapi"
)

type Client struct {
	apiKey string
	url    string
	http   *http.Client
}

func New(apiKey string, options ...Option) *Client {
	client := &Client{apiKey: strings.TrimSpace(apiKey), url: DefaultURL, http: &http.Client{Timeout: 15 * time.Second}}
	for _, option := range options {
		option(client)
	}
	return client
}

type Option func(*Client)

func WithURL(value string) Option {
	return func(c *Client) {
		if strings.TrimSpace(value) != "" {
			c.url = strings.TrimSpace(value)
		}
	}
}

func WithHTTPClient(httpClient *http.Client) Option {
	return func(c *Client) {
		if httpClient != nil {
			c.http = httpClient
		}
	}
}

func (c *Client) Name() string { return ProviderName }

func (c *Client) Send(ctx context.Context, req provider.SendRequest) (provider.SendResult, error) {
	if c.apiKey == "" {
		return provider.SendResult{}, providerError("missing_api_key", "mNotify/BMS API key is not configured", false, false, false, nil)
	}
	endpoint, err := url.Parse(c.url)
	if err != nil {
		return provider.SendResult{}, providerError("invalid_url", "mNotify/BMS URL is invalid", false, false, false, err)
	}
	query := endpoint.Query()
	query.Set("key", c.apiKey)
	query.Set("to", req.To)
	query.Set("msg", req.Body)
	query.Set("sender_id", req.From)
	endpoint.RawQuery = query.Encode()

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint.String(), nil)
	if err != nil {
		return provider.SendResult{}, providerError("build_request", "Unable to build mNotify/BMS request", false, false, false, err)
	}
	httpReq.Header.Set("Accept", "application/json")
	httpRes, err := c.http.Do(httpReq)
	if err != nil {
		return provider.SendResult{}, providerError("request_failed", "mNotify/BMS request failed", true, true, false, err)
	}
	defer httpRes.Body.Close()
	body, err := io.ReadAll(httpRes.Body)
	if err != nil {
		return provider.SendResult{}, providerError("read_response", "Unable to read mNotify/BMS response", true, true, false, err)
	}
	if httpRes.StatusCode < 200 || httpRes.StatusCode >= 300 {
		return provider.SendResult{}, providerError(fmt.Sprintf("http_%d", httpRes.StatusCode), string(body), isTemporaryHTTPStatus(httpRes.StatusCode), isTemporaryHTTPStatus(httpRes.StatusCode), false, nil)
	}
	var decoded sendResponse
	if err := json.Unmarshal(body, &decoded); err != nil {
		decoded = sendResponse{Message: string(body)}
	}
	result := toSendResult(c.Name(), body, decoded)
	if result.Status == provider.StatusFailed {
		return provider.SendResult{}, providerError("provider_failed", decoded.Message, false, false, false, nil)
	}
	return result, nil
}

func providerError(code, message string, temporary, retryable, fallbackOK bool, err error) *provider.ProviderError {
	return &provider.ProviderError{Provider: ProviderName, Code: code, Message: strings.TrimSpace(message), Temporary: temporary, Retryable: retryable, FallbackOK: fallbackOK, Err: err}
}

func isTemporaryHTTPStatus(status int) bool {
	return status == http.StatusTooManyRequests || status >= 500
}
