package arkesel

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/coffeyvidzro/dugble/server/internal/sms/provider"
)

const (
	ProviderName = "arkesel"
	DefaultURL   = "https://sms.arkesel.com/api/v2/sms/send"
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

func WithURL(url string) Option {
	return func(c *Client) {
		if strings.TrimSpace(url) != "" {
			c.url = strings.TrimSpace(url)
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
		return provider.SendResult{}, providerError("missing_api_key", "Arkesel API key is not configured", false, false, true, nil)
	}
	payload, err := json.Marshal(toSendRequest(req))
	if err != nil {
		return provider.SendResult{}, providerError("encode_request", "Unable to encode Arkesel request", false, false, false, err)
	}
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, c.url, bytes.NewReader(payload))
	if err != nil {
		return provider.SendResult{}, providerError("build_request", "Unable to build Arkesel request", false, false, false, err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("api-key", c.apiKey)

	httpRes, err := c.http.Do(httpReq)
	if err != nil {
		return provider.SendResult{}, providerError("request_failed", "Arkesel request failed", true, true, false, err)
	}
	defer httpRes.Body.Close()
	body, err := io.ReadAll(httpRes.Body)
	if err != nil {
		return provider.SendResult{}, providerError("read_response", "Unable to read Arkesel response", true, true, false, err)
	}
	if httpRes.StatusCode < 200 || httpRes.StatusCode >= 300 {
		return provider.SendResult{}, providerError(fmt.Sprintf("http_%d", httpRes.StatusCode), string(body), isTemporaryHTTPStatus(httpRes.StatusCode), isTemporaryHTTPStatus(httpRes.StatusCode), canFallbackHTTPStatus(httpRes.StatusCode), nil)
	}
	var decoded sendResponse
	if err := json.Unmarshal(body, &decoded); err != nil {
		return provider.SendResult{}, providerError("decode_response", "Unable to decode Arkesel response", true, true, false, err)
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
func canFallbackHTTPStatus(status int) bool {
	return status == http.StatusTooManyRequests || status == http.StatusBadGateway || status == http.StatusServiceUnavailable
}
