package wallets

import (
	"errors"
	"strconv"
	"strings"
)

func ParseUSDMicros(value string) (int64, error) {
	value = strings.TrimSpace(strings.TrimPrefix(value, "$"))
	if value == "" {
		return 0, errors.New("amount is required")
	}
	if strings.Contains(value, "-") {
		return 0, errors.New("amount must be positive")
	}

	whole, fraction, ok := strings.Cut(value, ".")
	if !ok {
		fraction = ""
	}
	if whole == "" {
		whole = "0"
	}
	if len(fraction) > 6 {
		return 0, errors.New("amount can have at most 6 decimal places")
	}

	dollars, err := strconv.ParseInt(whole, 10, 64)
	if err != nil {
		return 0, errors.New("amount must be a valid USD value")
	}
	for len(fraction) < 6 {
		fraction += "0"
	}
	micros, err := strconv.ParseInt(fraction, 10, 64)
	if err != nil {
		return 0, errors.New("amount must be a valid USD value")
	}

	amount := dollars*1_000_000 + micros
	if amount <= 0 {
		return 0, errors.New("amount must be greater than zero")
	}

	return amount, nil
}
