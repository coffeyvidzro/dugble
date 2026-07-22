package wallet

import (
	"encoding/json"
	"testing"

	"github.com/coffeyvidzro/dugble/server/internal/integration/fx"
	"github.com/coffeyvidzro/dugble/server/internal/integration/hubtel"
)

func TestMergeMetadataIncludesFXAndCheckoutDetails(t *testing.T) {
	t.Parallel()

	metadata, err := mergeMetadata(
		json.RawMessage(`{"source":"test"}`),
		hubtel.CheckoutData{CheckoutID: "checkout-123", CheckoutURL: "https://pay", CheckoutDirectURL: "https://pay/direct", ClientReference: "ref-123"},
		fx.Rate{Date: "2026-07-22", Rate: 12.34},
		10_000_000,
		12_340,
	)
	if err != nil {
		t.Fatalf("mergeMetadata returned error: %v", err)
	}

	var values map[string]any
	if err := json.Unmarshal(metadata, &values); err != nil {
		t.Fatalf("metadata is invalid JSON: %v", err)
	}
	assertEqual(t, values["source"], "test")
	assertEqual(t, values["provider"], "hubtel")
	assertEqual(t, values["wallet_currency"], CurrencyUSD)
	assertEqual(t, values["wallet_amount_micros"], float64(10_000_000))
	assertEqual(t, values["payment_currency"], "GHS")
	assertEqual(t, values["payment_amount"], 123.40)
	assertEqual(t, values["payment_amount_pesewas"], float64(12_340))
	assertEqual(t, values["exchange_rate"], "12.3400000000")
	assertEqual(t, values["exchange_rate_date"], "2026-07-22")
	assertEqual(t, values["exchange_rate_source"], "frankfurter")
	assertEqual(t, values["checkout_id"], "checkout-123")
	assertEqual(t, values["checkout_url"], "https://pay")
	assertEqual(t, values["checkout_direct_url"], "https://pay/direct")
	assertEqual(t, values["client_reference"], "ref-123")
}

func TestConvertUSDMicrosToGHSPesewas(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name      string
		usdMicros int64
		rate      float64
		want      int64
	}{
		{
			name:      "ten dollar top-up",
			usdMicros: 10_000_000,
			rate:      12.34,
			want:      12_340,
		},
		{
			name:      "rounds to nearest pesewa",
			usdMicros: 1_010_000,
			rate:      10.555,
			want:      1_066,
		},
		{
			name:      "supports sub-cent SMS price",
			usdMicros: 6_000,
			rate:      11.64,
			want:      7,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			got, err := convertUSDMicrosToGHSPesewas(tt.usdMicros, tt.rate)
			if err != nil {
				t.Fatalf("convertUSDMicrosToGHSPesewas returned error: %v", err)
			}
			if got != tt.want {
				t.Fatalf("convertUSDMicrosToGHSPesewas(%d, %v) = %d, want %d", tt.usdMicros, tt.rate, got, tt.want)
			}
		})
	}
}

func assertEqual(t *testing.T, got any, want any) {
	t.Helper()
	if got != want {
		t.Fatalf("got %v (%T), want %v (%T)", got, got, want, want)
	}
}
