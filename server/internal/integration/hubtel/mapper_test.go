package hubtel

import (
	"encoding/json"
	"testing"
)

func TestPaymentStatusFromCallback(t *testing.T) {
	t.Parallel()

	status, err := PaymentStatusFromCallback(CallbackPayload{Data: CallbackData{ClientReference: "ref-123", Status: "Success"}})
	if err != nil {
		t.Fatalf("PaymentStatusFromCallback returned error: %v", err)
	}
	if status.Provider != "hubtel" || status.ClientReference != "ref-123" || status.Status != "Success" || len(status.Raw) == 0 {
		t.Fatalf("status = %+v, want normalized callback status", status)
	}
}

func TestPaymentStatusFromTransactionStatus(t *testing.T) {
	t.Parallel()

	currency := "ghs"
	fulfilled := true
	status, err := PaymentStatusFromTransactionStatus(TransactionStatusResponse{Data: TransactionStatusData{
		ClientReference: "ref-123",
		Status:          "Paid",
		CurrencyCode:    &currency,
		Amount:          json.Number("123.40"),
		IsFulfilled:     &fulfilled,
	}})
	if err != nil {
		t.Fatalf("PaymentStatusFromTransactionStatus returned error: %v", err)
	}
	if status.Provider != "hubtel" || status.ClientReference != "ref-123" || status.Status != "Paid" || len(status.Raw) == 0 {
		t.Fatalf("status = %+v, want normalized transaction status", status)
	}
	if status.AmountPesewas != 12_340 || status.Currency != "GHS" || !status.IsFulfilled {
		t.Fatalf("status = %+v, want verified amount, currency and fulfillment", status)
	}
}

func TestAmountToPesewasRejectsSubPesewaPrecision(t *testing.T) {
	t.Parallel()

	if _, err := amountToPesewas(json.Number("1.001")); err == nil {
		t.Fatal("amountToPesewas accepted more than two decimal places")
	}
}

func TestIsPaidStatus(t *testing.T) {
	t.Parallel()

	for _, status := range []string{"Paid", "Success", " paid ", "SUCCESS"} {
		if !IsPaidStatus(status) {
			t.Fatalf("IsPaidStatus(%q) = false, want true", status)
		}
	}
	if IsPaidStatus("Unpaid") {
		t.Fatal("IsPaidStatus(Unpaid) = true, want false")
	}
}
