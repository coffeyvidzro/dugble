package identity

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
)

const maxAnalyzerResponseBytes = 1 << 20

type HTTPAnalyzerConfig struct {
	BaseURL string
	APIKey  string
	Timeout time.Duration
}

type HTTPAnalyzer struct {
	baseURL string
	apiKey  string
	client  *http.Client
}

func NewHTTPAnalyzer(cfg HTTPAnalyzerConfig) (*HTTPAnalyzer, error) {
	baseURL := strings.TrimRight(strings.TrimSpace(cfg.BaseURL), "/")
	apiKey := strings.TrimSpace(cfg.APIKey)
	if baseURL == "" {
		return nil, errors.New("identity AI base URL is required")
	}
	if apiKey == "" {
		return nil, errors.New("identity AI API key is required")
	}
	if cfg.Timeout <= 0 {
		cfg.Timeout = 30 * time.Second
	}
	return &HTTPAnalyzer{
		baseURL: baseURL,
		apiKey:  apiKey,
		client:  &http.Client{Timeout: cfg.Timeout},
	}, nil
}

func (a *HTTPAnalyzer) AnalyzeDocument(ctx context.Context, req DocumentAnalysisRequest) (DocumentAnalysisResult, error) {
	var result DocumentAnalysisResult
	err := a.postJSON(ctx, "/v1/documents/analyze", req, &result)
	return result, err
}

func (a *HTTPAnalyzer) CompareFaces(ctx context.Context, req FaceComparisonRequest) (FaceComparisonResult, error) {
	var result FaceComparisonResult
	err := a.postJSON(ctx, "/v1/faces/compare", req, &result)
	return result, err
}

func (a *HTTPAnalyzer) CheckLiveness(ctx context.Context, req LivenessRequest) (LivenessResult, error) {
	var result LivenessResult
	err := a.postJSON(ctx, "/v1/liveness/check", req, &result)
	return result, err
}

func (a *HTTPAnalyzer) postJSON(ctx context.Context, path string, payload any, result any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("encode identity AI request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, a.baseURL+path, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create identity AI request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+a.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return fmt.Errorf("call identity AI: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	limited := io.LimitReader(resp.Body, maxAnalyzerResponseBytes)
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		message, _ := io.ReadAll(limited)
		return fmt.Errorf("identity AI returned %s: %s", resp.Status, strings.TrimSpace(string(message)))
	}
	if err := json.NewDecoder(limited).Decode(result); err != nil {
		return fmt.Errorf("decode identity AI response: %w", err)
	}
	return nil
}
