package billing

import "fmt"

func productForDestination(teamMarket string, destinationCountry string) Product {
	if teamMarket == destinationCountry {
		return ProductSMSLocal
	}
	return ProductSMSIntl
}

func validateAuthorization(result Authorization, destinationCountry string) error {
	if result.Outcome != OutcomeApplied && result.Outcome != OutcomeAlreadyApplied {
		return outcomeError(result.Outcome)
	}
	if result.Product != productForDestination(result.MarketCode, destinationCountry) {
		return fmt.Errorf("billing product resolution mismatch: %s", result.Product)
	}
	return nil
}

func validateEmailAuthorizationResult(result Authorization) error {
	if result.Outcome != OutcomeApplied &&
		result.Outcome != OutcomeAlreadyApplied &&
		result.Outcome != OutcomeAllowanceApplied {
		return outcomeError(result.Outcome)
	}
	if result.Product != ProductEmail {
		return fmt.Errorf("email billing product resolution mismatch: %s", result.Product)
	}
	return nil
}

func outcomeError(outcome Outcome) error {
	switch outcome {
	case OutcomeAccountNotFound:
		return ErrAccountNotFound
	case OutcomeRateNotFound:
		return ErrRateNotFound
	case OutcomeCurrencyMismatch:
		return ErrCurrencyMismatch
	case OutcomeInsufficientBalance:
		return ErrInsufficientBalance
	default:
		return fmt.Errorf("unknown billing authorization outcome: %s", outcome)
	}
}
