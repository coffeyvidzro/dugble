package fx

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	frankfurterBaseURL = "https://api.frankfurter.dev/v2"
	defaultTimeout     = 15 * time.Second
)

type FrankfurterClient struct{ HTTPClient *http.Client }

type Rate struct {
	Date  string  `json:"date"`
	Base  string  `json:"base"`
	Quote string  `json:"quote"`
	Rate  float64 `json:"rate"`
}

func NewFrankfurterClient() *FrankfurterClient {
	return &FrankfurterClient{HTTPClient: &http.Client{Timeout: defaultTimeout}}
}

func (c *FrankfurterClient) LatestRate(ctx context.Context, base string, quote string) (Rate, error) {
	if c == nil {
		return Rate{}, errors.New("frankfurter client is nil")
	}
	client := c.HTTPClient
	if client == nil {
		client = &http.Client{Timeout: defaultTimeout}
	}
	base = strings.ToUpper(strings.TrimSpace(base))
	quote = strings.ToUpper(strings.TrimSpace(quote))
	if base == "" || quote == "" {
		return Rate{}, errors.New("base and quote currencies are required")
	}
	requestURL, err := url.Parse(frankfurterBaseURL + "/rates")
	if err != nil {
		return Rate{}, err
	}
	query := requestURL.Query()
	query.Set("base", base)
	query.Set("quotes", quote)
	requestURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestURL.String(), http.NoBody)
	if err != nil {
		return Rate{}, fmt.Errorf("create frankfurter request: %w", err)
	}
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return Rate{}, fmt.Errorf("send frankfurter request: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()
	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return Rate{}, fmt.Errorf("frankfurter api returned status %d", resp.StatusCode)
	}
	var rates []Rate
	if err := json.NewDecoder(resp.Body).Decode(&rates); err != nil {
		return Rate{}, fmt.Errorf("decode frankfurter response: %w", err)
	}
	for _, rate := range rates {
		if strings.EqualFold(rate.Base, base) && strings.EqualFold(rate.Quote, quote) {
			if rate.Rate <= 0 {
				return Rate{}, errors.New("frankfurter returned a non-positive rate")
			}
			return rate, nil
		}
	}
	return Rate{}, fmt.Errorf("frankfurter did not return %s/%s", base, quote)
}
