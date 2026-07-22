package hubtel

import "testing"

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

	status, err := PaymentStatusFromTransactionStatus(TransactionStatusResponse{Data: TransactionStatusData{ClientReference: "ref-123", Status: "Paid"}})
	if err != nil {
		t.Fatalf("PaymentStatusFromTransactionStatus returned error: %v", err)
	}
	if status.Provider != "hubtel" || status.ClientReference != "ref-123" || status.Status != "Paid" || len(status.Raw) == 0 {
		t.Fatalf("status = %+v, want normalized transaction status", status)
	}
}

func TestIsPaidStatus(t *testing.T) {
	t.Parallel()

	for _, status := range []string{"Paid", "Success"} {
		if !IsPaidStatus(status) {
			t.Fatalf("IsPaidStatus(%q) = false, want true", status)
		}
	}
	if IsPaidStatus("Unpaid") {
		t.Fatal("IsPaidStatus(Unpaid) = true, want false")
	}
}
