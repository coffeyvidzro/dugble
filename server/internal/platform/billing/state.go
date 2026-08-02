package billing

import "errors"

type Outcome string

const (
	OutcomeApplied             Outcome = "applied"
	OutcomeAlreadyApplied      Outcome = "already_applied"
	OutcomeInsufficientBalance Outcome = "insufficient_balance"
	OutcomeAccountNotFound     Outcome = "account_not_found"
	OutcomeRateNotFound        Outcome = "rate_not_found"
	OutcomeCurrencyMismatch    Outcome = "currency_mismatch"
)

var (
	ErrAccountNotFound     = errors.New("active team wallet not found")
	ErrRateNotFound        = errors.New("active product rate not found")
	ErrCurrencyMismatch    = errors.New("billing currency does not match team market")
	ErrInsufficientBalance = errors.New("insufficient wallet balance")
)
