package hubtel

import (
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
)

func PaymentStatusFromCallback(payload CallbackPayload) (PaymentStatus, error) {
	raw, err := json.Marshal(payload)
	if err != nil {
		return PaymentStatus{}, err
	}
	return PaymentStatus{
		ClientReference: strings.TrimSpace(payload.Data.ClientReference),
		Status:          strings.TrimSpace(payload.Data.Status),
		Provider:        "hubtel",
		Raw:             raw,
	}, nil
}

func PaymentStatusFromTransactionStatus(response TransactionStatusResponse) (PaymentStatus, error) {
	raw, err := json.Marshal(response)
	if err != nil {
		return PaymentStatus{}, err
	}
	amountPesewas, err := amountToPesewas(response.Data.Amount)
	if err != nil {
		return PaymentStatus{}, fmt.Errorf("parse Hubtel transaction amount: %w", err)
	}
	currency := ""
	if response.Data.CurrencyCode != nil {
		currency = strings.ToUpper(strings.TrimSpace(*response.Data.CurrencyCode))
	}
	fulfilled := response.Data.IsFulfilled != nil && *response.Data.IsFulfilled
	return PaymentStatus{
		ClientReference: strings.TrimSpace(response.Data.ClientReference),
		Status:          strings.TrimSpace(response.Data.Status),
		AmountPesewas:   amountPesewas,
		Currency:        currency,
		IsFulfilled:     fulfilled,
		Provider:        "hubtel",
		Raw:             raw,
	}, nil
}

func IsPaidStatus(status string) bool {
	return strings.EqualFold(strings.TrimSpace(status), "Paid") ||
		strings.EqualFold(strings.TrimSpace(status), "Success")
}

func amountToPesewas(amount json.Number) (int64, error) {
	value := strings.TrimSpace(amount.String())
	if value == "" {
		return 0, fmt.Errorf("amount is required")
	}
	rat, ok := new(big.Rat).SetString(value)
	if !ok {
		return 0, fmt.Errorf("invalid amount %q", value)
	}
	if rat.Sign() < 0 {
		return 0, fmt.Errorf("amount cannot be negative")
	}
	rat.Mul(rat, big.NewRat(100, 1))
	if !rat.IsInt() {
		return 0, fmt.Errorf("amount must have at most two decimal places")
	}
	minor := rat.Num()
	if !minor.IsInt64() {
		return 0, fmt.Errorf("amount exceeds int64")
	}
	return minor.Int64(), nil
}
