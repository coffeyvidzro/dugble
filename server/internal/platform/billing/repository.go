package billing

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

type Repository struct {
	queries *dbsqlc.Queries
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{queries: dbsqlc.New(db)}
}

func (r *Repository) AuthorizeSMS(
	ctx context.Context,
	tx pgx.Tx,
	input SMSAuthorizationInput,
) (Authorization, error) {
	row, err := r.queries.WithTx(tx).AuthorizeSMSCharge(ctx, dbsqlc.AuthorizeSMSChargeParams{
		TeamID: input.TeamID, ReferenceID: input.MessageID.String(),
		DestinationCountry: input.DestinationCountry, Segments: int64(input.Segments),
	})
	if err != nil {
		return Authorization{}, fmt.Errorf("authorize SMS charge: %w", err)
	}
	return Authorization{
		Outcome: Outcome(row.Outcome), MarketCode: row.MarketCode, Currency: row.Currency,
		Tier: row.Tier, Product: Product(row.Product), UnitCostUnits: row.UnitCostUnits,
		Quantity: row.Quantity, AmountUnits: row.AmountUnits, RemainingBalance: row.BalanceUnits,
	}, nil
}

func (r *Repository) AuthorizeEmail(
	ctx context.Context,
	tx pgx.Tx,
	input EmailAuthorizationInput,
) (Authorization, error) {
	row, err := r.queries.WithTx(tx).AuthorizeEmailCharge(ctx, dbsqlc.AuthorizeEmailChargeParams{
		TeamID: input.TeamID, ReferenceID: input.MessageID.String(),
	})
	if err != nil {
		return Authorization{}, fmt.Errorf("authorize email charge: %w", err)
	}
	return Authorization{
		Outcome: Outcome(row.Outcome), MarketCode: row.MarketCode, Currency: row.Currency,
		Tier: row.Tier, Product: Product(row.Product), UnitCostUnits: row.UnitCostUnits,
		Quantity: row.Quantity, AmountUnits: row.AmountUnits, RemainingBalance: row.BalanceUnits,
		CoveredByAllowance: row.CoveredByAllowance, RemainingAllowance: row.RemainingAllowance,
	}, nil
}
