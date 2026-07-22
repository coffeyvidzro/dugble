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
		123.40,
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
	assertEqual(t, values["wallet_amount"], float64(1000))
	assertEqual(t, values["payment_currency"], "GHS")
	assertEqual(t, values["payment_amount"], 123.40)
	assertEqual(t, values["exchange_rate"], 12.34)
	assertEqual(t, values["exchange_rate_date"], "2026-07-22")
	assertEqual(t, values["exchange_rate_source"], "frankfurter")
	assertEqual(t, values["checkout_id"], "checkout-123")
	assertEqual(t, values["checkout_url"], "https://pay")
	assertEqual(t, values["checkout_direct_url"], "https://pay/direct")
	assertEqual(t, values["client_reference"], "ref-123")
}

func TestRoundMoney(t *testing.T) {
	t.Parallel()

	if got := roundMoney(123.456); got != 123.46 {
		t.Fatalf("roundMoney(123.456) = %v, want 123.46", got)
	}
	if got := roundMoney(123.454); got != 123.45 {
		t.Fatalf("roundMoney(123.454) = %v, want 123.45", got)
	}
}

func assertEqual(t *testing.T, got any, want any) {
	t.Helper()
	if got != want {
		t.Fatalf("got %v (%T), want %v (%T)", got, got, want, want)
	}
}
