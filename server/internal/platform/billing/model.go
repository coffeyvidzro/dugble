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
	ProductEmail    Product = "email"
)

type SMSAuthorizationInput struct {
	TeamID             uuid.UUID
	MessageID          uuid.UUID
	DestinationCountry string
	Segments           int32
}

type Authorization struct {
	Outcome            Outcome
	MarketCode         string
	Currency           string
	Tier               string
	Product            Product
	UnitCostUnits      int64
	Quantity           int64
	AmountUnits        int64
	RemainingBalance   int64
	CoveredByAllowance bool
	RemainingAllowance int32
}

type EmailAuthorizationInput struct {
	TeamID    uuid.UUID
	MessageID uuid.UUID
}

type SMSAuthorizer interface {
	AuthorizeSMS(context.Context, pgx.Tx, SMSAuthorizationInput) (Authorization, error)
}

type EmailAuthorizer interface {
	AuthorizeEmail(context.Context, pgx.Tx, EmailAuthorizationInput) (Authorization, error)
}
