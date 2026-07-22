package wallet

import (
	"encoding/json"
	"time"
)

const (
	CurrencyUSD = "USD"

	MicrosPerUSD int64 = 1_000_000

	StatusActive    = "active"
	StatusSuspended = "suspended"
	StatusFrozen    = "frozen"

	TransactionTopUp      = "topup"
	TransactionSMSCharge  = "sms_charge"
	TransactionRefund     = "refund"
	TransactionAdjustment = "adjustment"

	TransactionStatusPending   = "pending"
	TransactionStatusCompleted = "completed"
	TransactionStatusFailed    = "failed"
)

type Wallet struct {
	ID            string    `json:"id"`
	TeamID        string    `json:"team_id"`
	Currency      string    `json:"currency"`
	BalanceMicros int64     `json:"balance_micros"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Transaction struct {
	ID                 string          `json:"id"`
	WalletID           string          `json:"wallet_id"`
	TeamID             string          `json:"team_id"`
	TransactionType    string          `json:"transaction_type"`
	ReferenceID        *string         `json:"reference_id,omitempty"`
	AmountMicros       int64           `json:"amount_micros"`
	BalanceAfterMicros int64           `json:"balance_after_micros"`
	Status             string          `json:"status"`
	Description        *string         `json:"description,omitempty"`
	Metadata           json.RawMessage `json:"metadata"`
	CreatedAt          time.Time       `json:"created_at"`
}

type TopUpRequest struct {
	AmountMicros int64           `json:"amount_micros"`
	Description  *string         `json:"description,omitempty"`
	Metadata     json.RawMessage `json:"metadata,omitempty"`
}

type TopUpResponse struct {
	CheckoutURL           string      `json:"checkout_url"`
	CheckoutID            string      `json:"checkout_id"`
	ClientReference       string      `json:"client_reference"`
	CheckoutDirectURL     string      `json:"checkout_direct_url"`
	WalletCurrency        string      `json:"wallet_currency"`
	WalletAmountMicros    int64       `json:"wallet_amount_micros"`
	PaymentCurrency       string      `json:"payment_currency"`
	PaymentAmount         float64     `json:"payment_amount"`
	PaymentAmountPesewas  int64       `json:"payment_amount_pesewas"`
	ExchangeRate          string      `json:"exchange_rate"`
	ExchangeRateDate      string      `json:"exchange_rate_date"`
	Transaction           Transaction `json:"transaction"`
}

type ListTransactionsRequest struct {
	Limit  int32
	Offset int32
}
