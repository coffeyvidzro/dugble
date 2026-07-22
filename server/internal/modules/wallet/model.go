package wallet

import (
	"encoding/json"
	"time"
)

const (
	CurrencyUSD = "USD"

	StatusActive    = "active"
	StatusSuspended = "suspended"
	StatusFrozen    = "frozen"

	TransactionTopUp      = "topup"
	TransactionSMSCharge  = "sms_charge"
	TransactionRefund     = "refund"
	TransactionAdjustment = "adjustment"

	TransactionStatusPending   = "pending"
	TransactionStatusCompleted = "completed"
)

type Wallet struct {
	ID        string    `json:"id"`
	TeamID    string    `json:"team_id"`
	Currency  string    `json:"currency"`
	Balance   int64     `json:"balance"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Transaction struct {
	ID              string          `json:"id"`
	WalletID        string          `json:"wallet_id"`
	TeamID          string          `json:"team_id"`
	TransactionType string          `json:"transaction_type"`
	ReferenceID     *string         `json:"reference_id,omitempty"`
	Amount          int64           `json:"amount"`
	BalanceAfter    int64           `json:"balance_after"`
	Status          string          `json:"status"`
	Description     *string         `json:"description,omitempty"`
	Metadata        json.RawMessage `json:"metadata"`
	CreatedAt       time.Time       `json:"created_at"`
}

type TopUpRequest struct {
	Amount      int64           `json:"amount"`
	Description *string         `json:"description,omitempty"`
	Metadata    json.RawMessage `json:"metadata,omitempty"`
}

type TopUpResponse struct {
	CheckoutURL       string      `json:"checkout_url"`
	CheckoutID        string      `json:"checkout_id"`
	ClientReference   string      `json:"client_reference"`
	CheckoutDirectURL string      `json:"checkout_direct_url"`
	Transaction       Transaction `json:"transaction"`
}

type ListTransactionsRequest struct {
	Limit  int32
	Offset int32
}
