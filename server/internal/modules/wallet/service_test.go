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
		1000,
		12340,
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
	assertEqual(t, values["wallet_amount_cents"], float64(1000))
	assertEqual(t, values["payment_currency"], "GHS")
	assertEqual(t, values["payment_amount"], 123.40)
	assertEqual(t, values["payment_amount_cents"], float64(12340))
	assertEqual(t, values["exchange_rate"], "12.3400000000")
	assertEqual(t, values["exchange_rate_date"], "2026-07-22")
	assertEqual(t, values["exchange_rate_source"], "frankfurter")
	assertEqual(t, values["checkout_id"], "checkout-123")
	assertEqual(t, values["checkout_url"], "https://pay")
	assertEqual(t, values["checkout_direct_url"], "https://pay/direct")
	assertEqual(t, values["client_reference"], "ref-123")
}

func TestConvertUSDCentsToGHSPesewas(t *testing.T) {
	t.Parallel()

	got, err := convertUSDCentsToGHSPesewas(1000, 12.34)
	if err != nil {
		t.Fatalf("convertUSDCentsToGHSPesewas returned error: %v", err)
	}
	if got != 12340 {
		t.Fatalf("convertUSDCentsToGHSPesewas(1000, 12.34) = %v, want 12340", got)
	}

	got, err = convertUSDCentsToGHSPesewas(101, 10.555)
	if err != nil {
		t.Fatalf("convertUSDCentsToGHSPesewas returned error: %v", err)
	}
	if got != 1066 {
		t.Fatalf("convertUSDCentsToGHSPesewas(101, 10.555) = %v, want 1066", got)
	}
}

func assertEqual(t *testing.T, got any, want any) {
	t.Helper()
	if got != want {
		t.Fatalf("got %v (%T), want %v (%T)", got, got, want, want)
	}
}
