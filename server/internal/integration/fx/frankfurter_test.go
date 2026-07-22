package fx

import (
	"context"
	"io"
	"net/http"
	"strings"
	"testing"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) { return fn(req) }

func TestFrankfurterLatestRate(t *testing.T) {
	t.Parallel()

	client := &FrankfurterClient{HTTPClient: &http.Client{Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
		if req.Method != http.MethodGet {
			t.Fatalf("method = %s, want GET", req.Method)
		}
		if req.URL.Path != "/v2/rates" {
			t.Fatalf("path = %s, want /v2/rates", req.URL.Path)
		}
		if got := req.URL.Query().Get("base"); got != "USD" {
			t.Fatalf("base = %s, want USD", got)
		}
		if got := req.URL.Query().Get("quotes"); got != "GHS" {
			t.Fatalf("quotes = %s, want GHS", got)
		}
		return &http.Response{
			StatusCode: http.StatusOK,
			Body:       io.NopCloser(strings.NewReader(`[{"date":"2026-07-22","base":"USD","quote":"GHS","rate":12.34}]`)),
			Header:     make(http.Header),
		}, nil
	})}}

	rate, err := client.LatestRate(context.Background(), " usd ", " ghs ")
	if err != nil {
		t.Fatalf("LatestRate returned error: %v", err)
	}
	if rate.Base != "USD" || rate.Quote != "GHS" || rate.Rate != 12.34 || rate.Date != "2026-07-22" {
		t.Fatalf("rate = %+v, want USD/GHS 12.34 on 2026-07-22", rate)
	}
}

func TestFrankfurterLatestRateRejectsMissingQuote(t *testing.T) {
	t.Parallel()

	client := &FrankfurterClient{HTTPClient: &http.Client{Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
		return &http.Response{
			StatusCode: http.StatusOK,
			Body:       io.NopCloser(strings.NewReader(`[{"date":"2026-07-22","base":"USD","quote":"EUR","rate":0.9}]`)),
			Header:     make(http.Header),
		}, nil
	})}}

	if _, err := client.LatestRate(context.Background(), "USD", "GHS"); err == nil {
		t.Fatal("LatestRate returned nil error for missing quote")
	}
}
