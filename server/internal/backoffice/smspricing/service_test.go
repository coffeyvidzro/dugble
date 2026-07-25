package smspricing

import (
	"errors"
	"testing"
	"time"
)

func TestParseUSDToMicros(t *testing.T) {
	tests := []struct {
		value string
		want  int64
	}{
		{value: "0.009", want: 9_000},
		{value: "$0.00125", want: 1_250},
		{value: "1", want: 1_000_000},
		{value: ".5", want: 500_000},
	}

	for _, test := range tests {
		t.Run(test.value, func(t *testing.T) {
			got, err := parseUSDToMicros(test.value)
			if err != nil {
				t.Fatalf("parseUSDToMicros(%q) returned error: %v", test.value, err)
			}
			if got != test.want {
				t.Fatalf("parseUSDToMicros(%q) = %d, want %d", test.value, got, test.want)
			}
		})
	}
}

func TestParseUSDToMicrosRejectsInvalidValues(t *testing.T) {
	for _, value := range []string{"", "0", "-0.01", "1.0000001", "abc", "1.2.3"} {
		t.Run(value, func(t *testing.T) {
			if _, err := parseUSDToMicros(value); err == nil {
				t.Fatalf("parseUSDToMicros(%q) returned nil error", value)
			}
		})
	}
}

func TestRateLifecycle(t *testing.T) {
	now := time.Date(2026, 7, 24, 20, 0, 0, 0, time.UTC)
	past := now.Add(-time.Hour)
	future := now.Add(time.Hour)

	tests := []struct {
		name string
		rate RateRow
		want string
	}{
		{name: "current open ended", rate: RateRow{Status: "active", EffectiveFrom: past}, want: "current"},
		{name: "scheduled", rate: RateRow{Status: "active", EffectiveFrom: future}, want: "scheduled"},
		{name: "expired", rate: RateRow{Status: "active", EffectiveFrom: past, EffectiveUntil: &past}, want: "expired"},
		{name: "archived", rate: RateRow{Status: "archived", EffectiveFrom: future}, want: "archived"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := rateLifecycle(test.rate, now); got != test.want {
				t.Fatalf("rateLifecycle() = %q, want %q", got, test.want)
			}
		})
	}
}

func TestNormalizeRateRequestNormalizesCountry(t *testing.T) {
	country, micros, from, until, err := normalizeRateRequest(AddRateRequest{
		DestinationCountry: " gh ",
		UnitCostUSD:        "0.009",
		EffectiveFrom:     "2026-07-25T10:00",
	}, time.Time{})
	if err != nil {
		t.Fatalf("normalizeRateRequest returned error: %v", err)
	}
	if country != "GH" || micros != 9_000 || from.IsZero() || until != nil {
		t.Fatalf("normalizeRateRequest() = %q, %d, %v, %v", country, micros, from, until)
	}
}

func TestNormalizeRateRequestRejectsInvalidCountry(t *testing.T) {
	_, _, _, _, err := normalizeRateRequest(AddRateRequest{
		DestinationCountry: "GHA",
		UnitCostUSD:        "0.009",
		EffectiveFrom:     "2026-07-25T10:00",
	}, time.Time{})
	if !errors.Is(err, ErrInvalidRequest) {
		t.Fatalf("normalizeRateRequest error = %v, want ErrInvalidRequest", err)
	}
}

func TestNormalizeRateRequestRequiresFutureEnd(t *testing.T) {
	_, _, _, _, err := normalizeRateRequest(AddRateRequest{
		DestinationCountry: "GH",
		UnitCostUSD:        "0.009",
		EffectiveFrom:     "2026-07-25T10:00",
		EffectiveUntil:    "2026-07-25T09:00",
	}, time.Time{})
	if !errors.Is(err, ErrInvalidRequest) {
		t.Fatalf("normalizeRateRequest error = %v, want ErrInvalidRequest", err)
	}
}

func TestFormatMicrosInput(t *testing.T) {
	if got := formatMicrosInput(9_000); got != "0.009000" {
		t.Fatalf("formatMicrosInput() = %q, want %q", got, "0.009000")
	}
}
