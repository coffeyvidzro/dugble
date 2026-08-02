package billing

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type Product string

const (
	ProductSMSLocal Product = "sms_local"
	ProductSMSIntl  Product = "sms_intl"
)

type SMSAuthorizationInput struct {
	TeamID             uuid.UUID
	MessageID          uuid.UUID
	DestinationCountry string
	Segments           int32
}

type Authorization struct {
	Outcome          Outcome
	MarketCode       string
	Currency         string
	Tier             string
	Product          Product
	UnitCostUnits    int64
	Quantity         int64
	AmountUnits      int64
	RemainingBalance int64
}

type SMSAuthorizer interface {
	AuthorizeSMS(context.Context, pgx.Tx, SMSAuthorizationInput) (Authorization, error)
}
