package wallets

import "time"

type Filter struct {
	Query  string
	Status string
}

type Row struct {
	ID        string
	TeamID    string
	TeamName  string
	Currency  string
	Balance   int64
	Status    string
	UpdatedAt time.Time
}

type Detail struct {
	Wallet       Row
	Transactions []TransactionRow
}

type TransactionRow struct {
	ID              string
	TransactionType string
	ReferenceID     string
	Amount          int64
	BalanceAfter    int64
	Status          string
	Description     string
	Metadata        string
	CreatedAt       time.Time
}

type AdjustmentRequest struct {
	Direction string
	AmountUSD string
	Reason    string
}

type StatusRequest struct {
	Action string
	Reason string
}
