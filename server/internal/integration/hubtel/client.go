package hubtel

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/coffeyvidzro/dugble/server/internal/config"
)

const (
	defaultBaseURL       = "https://payproxyapi.hubtel.com"
	defaultClientTimeout = 30 * time.Second
	maxResponseBodyBytes = 1 << 20
)

type Client struct {
	BaseURL               string
	APIID                 string
	APIKey                string
	MerchantAccountNumber string
	CallbackURL           string
	ReturnURL             string
	CancellationURL       string
	HTTPClient            *http.Client
}

type APIError struct {
	StatusCode int
	Body       string
}

func (e *APIError) Error() string {
	if strings.TrimSpace(e.Body) == "" {
		return fmt.Sprintf("hubtel api returned status %d", e.StatusCode)
	}
	return fmt.Sprintf("hubtel api returned status %d: %s", e.StatusCode, e.Body)
}

func NewClient(cfg config.HubtelConfig) *Client {
	baseURL := strings.TrimSpace(cfg.BaseURL)
	if baseURL == "" {
		baseURL = defaultBaseURL
	}
	return &Client{
		BaseURL:               strings.TrimRight(baseURL, "/"),
		APIID:                 strings.TrimSpace(cfg.APIID),
		APIKey:                strings.TrimSpace(cfg.APIKey),
		MerchantAccountNumber: strings.TrimSpace(cfg.MerchantAccountNumber),
		CallbackURL:           strings.TrimSpace(cfg.CallbackURL),
		ReturnURL:             strings.TrimSpace(cfg.ReturnURL),
		CancellationURL:       strings.TrimSpace(cfg.CancellationURL),
		HTTPClient:            &http.Client{Timeout: defaultClientTimeout},
	}
}

func (c *Client) InitiateCheckout(ctx context.Context, req InitiateCheckoutRequest) (InitiateCheckoutResponse, error) {
	if req.MerchantAccountNumber == "" {
		req.MerchantAccountNumber = c.MerchantAccountNumber
	}
	if req.CallbackURL == "" {
		req.CallbackURL = c.CallbackURL
	}
	if req.ReturnURL == "" {
		req.ReturnURL = c.ReturnURL
	}
	if req.CancellationURL == "" {
		req.CancellationURL = c.CancellationURL
	}
	var result InitiateCheckoutResponse
	if err := c.doRequest(ctx, http.MethodPost, "/items/initiate", req, &result); err != nil {
		return InitiateCheckoutResponse{}, err
	}
	return result, nil
}

func (c *Client) doRequest(ctx context.Context, method string, path string, payload any, result any) error {
	if c == nil {
		return errors.New("hubtel client is nil")
	}
	if strings.TrimSpace(c.BaseURL) == "" {
		return errors.New("hubtel base URL is required")
	}
	if strings.TrimSpace(c.APIID) == "" || strings.TrimSpace(c.APIKey) == "" {
		return errors.New("hubtel API ID and API key are required")
	}
	if c.HTTPClient == nil {
		return errors.New("hubtel HTTP client is required")
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("encode hubtel request: %w", err)
	}
	req, err := http.NewRequestWithContext(ctx, method, strings.TrimRight(c.BaseURL, "/")+"/"+strings.TrimLeft(path, "/"), bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("create hubtel request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(c.APIID, c.APIKey)

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("send hubtel request: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()
	responseBody, err := io.ReadAll(io.LimitReader(resp.Body, maxResponseBodyBytes))
	if err != nil {
		return fmt.Errorf("read hubtel response: %w", err)
	}
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return &APIError{StatusCode: resp.StatusCode, Body: strings.TrimSpace(string(responseBody))}
	}
	if result == nil || len(bytes.TrimSpace(responseBody)) == 0 {
		return nil
	}
	if err := json.Unmarshal(responseBody, result); err != nil {
		return fmt.Errorf("decode hubtel response: %w", err)
	}
	return nil
}
