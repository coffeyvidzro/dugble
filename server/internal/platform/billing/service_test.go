package billing

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type fakeAuthorizationRepository struct {
	result Authorization
	err    error
	input  SMSAuthorizationInput
	calls  int
}

func (f *fakeAuthorizationRepository) AuthorizeSMS(
	_ context.Context,
	_ pgx.Tx,
	input SMSAuthorizationInput,
) (Authorization, error) {
	f.calls++
	f.input = input
	return f.result, f.err
}

func TestAuthorizeSMSNormalizesAndReturnsAppliedCharge(t *testing.T) {
	repository := &fakeAuthorizationRepository{result: Authorization{
		Outcome: OutcomeApplied, MarketCode: "GH", Currency: "GHS", Tier: "growth",
		Product: ProductSMSIntl, UnitCostUnits: 17544, Quantity: 2,
		AmountUnits: 35188, RemainingBalance: 64812,
	}}
	input := SMSAuthorizationInput{
		TeamID: uuid.New(), MessageID: uuid.New(), DestinationCountry: " ng ", Segments: 2,
	}
	result, err := NewService(repository).AuthorizeSMS(context.Background(), nil, input)
	if err != nil {
		t.Fatalf("AuthorizeSMS() error = %v", err)
	}
	if repository.input.DestinationCountry != "NG" || result.Product != ProductSMSIntl || result.AmountUnits != 35188 {
		t.Fatalf("AuthorizeSMS() input/result = %+v/%+v", repository.input, result)
	}
}

func TestAuthorizeSMSAcceptsIdempotentReplay(t *testing.T) {
	repository := &fakeAuthorizationRepository{result: Authorization{
		Outcome: OutcomeAlreadyApplied, MarketCode: "KE", Product: ProductSMSLocal,
	}}
	_, err := NewService(repository).AuthorizeSMS(context.Background(), nil, SMSAuthorizationInput{
		TeamID: uuid.New(), MessageID: uuid.New(), DestinationCountry: "KE", Segments: 1,
	})
	if err != nil {
		t.Fatalf("AuthorizeSMS() replay error = %v", err)
	}
}

func TestAuthorizeSMSMapsAuthorizationOutcomes(t *testing.T) {
	tests := []struct {
		outcome Outcome
		want    error
	}{
		{OutcomeAccountNotFound, ErrAccountNotFound},
		{OutcomeRateNotFound, ErrRateNotFound},
		{OutcomeCurrencyMismatch, ErrCurrencyMismatch},
		{OutcomeInsufficientBalance, ErrInsufficientBalance},
	}
	for _, test := range tests {
		repository := &fakeAuthorizationRepository{result: Authorization{Outcome: test.outcome}}
		_, err := NewService(repository).AuthorizeSMS(context.Background(), nil, SMSAuthorizationInput{
			TeamID: uuid.New(), MessageID: uuid.New(), DestinationCountry: "GH", Segments: 1,
		})
		if !errors.Is(err, test.want) {
			t.Fatalf("AuthorizeSMS(%s) error = %v, want %v", test.outcome, err, test.want)
		}
	}
}

func TestAuthorizeSMSRejectsInvalidInputBeforeRepositoryCall(t *testing.T) {
	tests := []SMSAuthorizationInput{
		{MessageID: uuid.New(), DestinationCountry: "GH", Segments: 1},
		{TeamID: uuid.New(), DestinationCountry: "GH", Segments: 1},
		{TeamID: uuid.New(), MessageID: uuid.New(), Segments: 1},
		{TeamID: uuid.New(), MessageID: uuid.New(), DestinationCountry: "GH"},
	}
	for _, input := range tests {
		repository := &fakeAuthorizationRepository{}
		if _, err := NewService(repository).AuthorizeSMS(context.Background(), nil, input); err == nil {
			t.Fatalf("AuthorizeSMS(%+v) accepted invalid input", input)
		}
		if repository.calls != 0 {
			t.Fatalf("AuthorizeSMS(%+v) called repository", input)
		}
	}
}

func TestProductForDestination(t *testing.T) {
	if got := productForDestination("GH", "GH"); got != ProductSMSLocal {
		t.Fatalf("productForDestination(GH, GH) = %s", got)
	}
	if got := productForDestination("GH", "NG"); got != ProductSMSIntl {
		t.Fatalf("productForDestination(GH, NG) = %s", got)
	}
}
