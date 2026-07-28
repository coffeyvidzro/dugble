package identity

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/coffeyvidzro/dugble/server/internal/config"
)

type Client struct {
	baseURL         string
	apiKey          string
	guidanceTimeout time.Duration
	analysisTimeout time.Duration
	maxResponseSize int64
	HTTPClient      *http.Client
}

var _ Analyzer = (*Client)(nil)

func NewClient(cfg config.IdentityAIConfig) *Client {
	if cfg.GuidanceTimeout <= 0 {
		cfg.GuidanceTimeout = 3 * time.Second
	}
	if cfg.AnalysisTimeout <= 0 {
		cfg.AnalysisTimeout = 30 * time.Second
	}
	if cfg.MaxResponseSize <= 0 {
		cfg.MaxResponseSize = 1 << 20
	}
	return &Client{
		baseURL:         strings.TrimRight(strings.TrimSpace(cfg.BaseURL), "/"),
		apiKey:          strings.TrimSpace(cfg.APIKey),
		guidanceTimeout: cfg.GuidanceTimeout,
		analysisTimeout: cfg.AnalysisTimeout,
		maxResponseSize: cfg.MaxResponseSize,
		HTTPClient:      &http.Client{},
	}
}

func (c *Client) Ready(ctx context.Context) (Readiness, error) {
	var result Readiness
	if err := c.do(ctx, c.guidanceTimeout, http.MethodGet, "/ready", nil, &result); err != nil {
		return Readiness{}, err
	}
	return result, nil
}

func (c *Client) CheckLiveness(ctx context.Context, request LivenessRequest) (LivenessEvidence, error) {
	if err := validateLivenessRequest(request); err != nil {
		return LivenessEvidence{}, err
	}
	var result LivenessEvidence
	if err := c.do(ctx, c.analysisTimeout, http.MethodPost, "/v1/liveness/check", request, &result); err != nil {
		return LivenessEvidence{}, err
	}
	return result, validateLivenessEvidence(result)
}

func (c *Client) CompareFaces(ctx context.Context, request FaceComparisonRequest) (FaceComparisonEvidence, error) {
	if err := validateFaceComparisonRequest(request); err != nil {
		return FaceComparisonEvidence{}, err
	}
	var result FaceComparisonEvidence
	if err := c.do(ctx, c.analysisTimeout, http.MethodPost, "/v1/faces/compare", request, &result); err != nil {
		return FaceComparisonEvidence{}, err
	}
	return result, validateFaceComparisonEvidence(result)
}

func (c *Client) do(ctx context.Context, timeout time.Duration, method, path string, payload, result any) error {
	if err := c.validate(); err != nil {
		return err
	}
	requestContext := ctx
	cancel := func() {}
	if timeout > 0 {
		requestContext, cancel = context.WithTimeout(ctx, timeout)
	}
	defer cancel()

	var body io.Reader = http.NoBody
	if payload != nil {
		encoded, err := json.Marshal(payload)
		if err != nil {
			return fmt.Errorf("encode identity AI request: %w", err)
		}
		body = bytes.NewReader(encoded)
	}
	req, err := http.NewRequestWithContext(
		requestContext,
		method,
		c.baseURL+"/"+strings.TrimLeft(path, "/"),
		body,
	)
	if err != nil {
		return fmt.Errorf("create identity AI request: %w", err)
	}
	req.Header.Set("Accept", "application/json")
	if payload != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	response, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("send identity AI request: %w", err)
	}
	defer func() { _ = response.Body.Close() }()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, c.maxResponseSize+1))
	if err != nil {
		return fmt.Errorf("read identity AI response: %w", err)
	}
	if int64(len(responseBody)) > c.maxResponseSize {
		return errors.New("identity AI response exceeds configured size limit")
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return apiError(response.StatusCode, responseBody)
	}
	if result == nil || len(bytes.TrimSpace(responseBody)) == 0 {
		return nil
	}
	decoder := json.NewDecoder(bytes.NewReader(responseBody))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(result); err != nil {
		return fmt.Errorf("decode identity AI response: %w", err)
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return errors.New("identity AI response must contain exactly one JSON value")
	}
	return nil
}

func (c *Client) validate() error {
	if c == nil {
		return errors.New("identity AI client is nil")
	}
	parsed, err := url.Parse(c.baseURL)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return errors.New("identity AI base URL must be an absolute HTTP or HTTPS URL")
	}
	if parsed.User != nil || parsed.RawQuery != "" || parsed.Fragment != "" {
		return errors.New("identity AI base URL must not contain credentials, query, or fragment")
	}
	if c.apiKey == "" {
		return errors.New("identity AI API key is required")
	}
	if c.HTTPClient == nil {
		return errors.New("identity AI HTTP client is required")
	}
	if c.maxResponseSize <= 0 {
		return errors.New("identity AI response size limit must be positive")
	}
	return nil
}

func apiError(statusCode int, body []byte) error {
	var detail struct {
		Detail string `json:"detail"`
	}
	_ = json.Unmarshal(body, &detail)
	code := strings.TrimSpace(detail.Detail)
	if len(code) > 120 {
		code = "request_failed"
	}
	return &APIError{StatusCode: statusCode, Code: code, Retryable: retryableStatus(statusCode)}
}
