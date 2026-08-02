package database_test

import (
	"context"
	"errors"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

func TestCreditTeamWalletIsIdempotentUnderConcurrency(t *testing.T) {
	db := billingTestDatabase(t)
	teamID := insertBillingTestTeam(t, db, 0)
	queries := dbsqlc.New(db)
	params := dbsqlc.CreditTeamWalletParams{
		TeamID:          teamID,
		AmountUnits:     100,
		TransactionType: "deposit",
		ReferenceID:     "concurrent-deposit",
	}

	successes, duplicates := runConcurrentWalletMutations(t, 10, func(ctx context.Context, _ int) error {
		_, err := queries.CreditTeamWallet(ctx, params)
		return err
	})
	if successes != 1 || duplicates != 9 {
		t.Fatalf("credit results: successes=%d duplicates=%d", successes, duplicates)
	}

	assertBillingState(t, db, teamID, 100, 1, 100)
}

func TestDebitTeamWalletDoesNotOverdrawUnderConcurrency(t *testing.T) {
	db := billingTestDatabase(t)
	teamID := insertBillingTestTeam(t, db, 100)
	queries := dbsqlc.New(db)

	references := []string{"concurrent-usage-1", "concurrent-usage-2"}
	successes, rejected := runConcurrentWalletMutations(t, len(references), func(ctx context.Context, index int) error {
		_, err := queries.DebitTeamWallet(ctx, dbsqlc.DebitTeamWalletParams{
			AmountUnits:     80,
			TransactionType: "usage_sms",
			ReferenceID:     references[index],
			TeamID:          teamID,
		})
		return err
	})
	if successes != 1 || rejected != 1 {
		t.Fatalf("debit results: successes=%d rejected=%d", successes, rejected)
	}

	assertBillingState(t, db, teamID, 20, 1, -80)
}

func TestAuthorizeSMSChargeAppliesOnceAndChecksBalance(t *testing.T) {
	db := billingTestDatabase(t)
	teamID := insertBillingTestTeam(t, db, 20000)
	queries := dbsqlc.New(db)
	messageID := uuid.New()
	params := dbsqlc.AuthorizeSMSChargeParams{
		TeamID: teamID, ReferenceID: messageID.String(), DestinationCountry: "GH", Segments: 2,
	}

	first, err := queries.AuthorizeSMSCharge(context.Background(), params)
	if err != nil {
		t.Fatalf("authorize first SMS charge: %v", err)
	}
	if first.Outcome != "applied" || first.Product != "sms_local" || first.AmountUnits != 13000 || first.BalanceUnits != 7000 {
		t.Fatalf("first authorization = %+v", first)
	}

	replay, err := queries.AuthorizeSMSCharge(context.Background(), params)
	if err != nil {
		t.Fatalf("authorize replayed SMS charge: %v", err)
	}
	if replay.Outcome != "already_applied" || replay.BalanceUnits != 7000 {
		t.Fatalf("replayed authorization = %+v", replay)
	}

	insufficient, err := queries.AuthorizeSMSCharge(context.Background(), dbsqlc.AuthorizeSMSChargeParams{
		TeamID: teamID, ReferenceID: uuid.NewString(), DestinationCountry: "GH", Segments: 2,
	})
	if err != nil {
		t.Fatalf("authorize insufficient SMS charge: %v", err)
	}
	if insufficient.Outcome != "insufficient_balance" || insufficient.BalanceUnits != 7000 {
		t.Fatalf("insufficient authorization = %+v", insufficient)
	}

	assertBillingState(t, db, teamID, 7000, 1, -13000)
}

func TestAuthorizeEmailChargeUsesAllowanceIdempotently(t *testing.T) {
	db := billingTestDatabase(t)
	teamID := insertBillingTestTeam(t, db, 0)
	queries := dbsqlc.New(db)
	params := dbsqlc.AuthorizeEmailChargeParams{TeamID: teamID, ReferenceID: uuid.NewString()}

	first, err := queries.AuthorizeEmailCharge(context.Background(), params)
	if err != nil {
		t.Fatalf("authorize allowance email: %v", err)
	}
	if first.Outcome != "allowance_applied" || !first.CoveredByAllowance || first.RemainingAllowance != 999 || first.AmountUnits != 0 {
		t.Fatalf("allowance authorization = %+v", first)
	}

	replay, err := queries.AuthorizeEmailCharge(context.Background(), params)
	if err != nil {
		t.Fatalf("authorize replayed allowance email: %v", err)
	}
	if replay.Outcome != "already_applied" || !replay.CoveredByAllowance || replay.RemainingAllowance != 999 {
		t.Fatalf("replayed allowance authorization = %+v", replay)
	}

	assertEmailBillingState(t, db, teamID, 0, 999, 0, 1)
}

func TestAuthorizeEmailChargeDebitsAfterAllowanceIsExhausted(t *testing.T) {
	db := billingTestDatabase(t)
	teamID := insertBillingTestTeam(t, db, 1000)
	if _, err := db.Exec(context.Background(), `
		UPDATE team_wallets SET free_email_allowance = 0 WHERE team_id = $1
	`, teamID); err != nil {
		t.Fatalf("exhaust email allowance: %v", err)
	}
	queries := dbsqlc.New(db)
	params := dbsqlc.AuthorizeEmailChargeParams{TeamID: teamID, ReferenceID: uuid.NewString()}

	first, err := queries.AuthorizeEmailCharge(context.Background(), params)
	if err != nil {
		t.Fatalf("authorize paid email: %v", err)
	}
	if first.Outcome != "applied" || first.CoveredByAllowance || first.AmountUnits != 936 || first.BalanceUnits != 64 {
		t.Fatalf("paid email authorization = %+v", first)
	}

	replay, err := queries.AuthorizeEmailCharge(context.Background(), params)
	if err != nil {
		t.Fatalf("authorize replayed paid email: %v", err)
	}
	if replay.Outcome != "already_applied" || replay.BalanceUnits != 64 {
		t.Fatalf("replayed paid authorization = %+v", replay)
	}

	insufficient, err := queries.AuthorizeEmailCharge(context.Background(), dbsqlc.AuthorizeEmailChargeParams{
		TeamID: teamID, ReferenceID: uuid.NewString(),
	})
	if err != nil {
		t.Fatalf("authorize insufficient email: %v", err)
	}
	if insufficient.Outcome != "insufficient_balance" || insufficient.BalanceUnits != 64 {
		t.Fatalf("insufficient email authorization = %+v", insufficient)
	}

	assertEmailBillingState(t, db, teamID, 64, 0, 1, 0)
}

func runConcurrentWalletMutations(
	t *testing.T,
	count int,
	mutation func(context.Context, int) error,
) (successes int, noRows int) {
	t.Helper()
	start := make(chan struct{})
	results := make(chan error, count)
	var workers sync.WaitGroup
	for index := range count {
		workers.Add(1)
		go func() {
			defer workers.Done()
			<-start
			ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()
			results <- mutation(ctx, index)
		}()
	}
	close(start)
	workers.Wait()
	close(results)

	for err := range results {
		switch {
		case err == nil:
			successes++
		case errors.Is(err, pgx.ErrNoRows):
			noRows++
		default:
			t.Fatalf("wallet mutation: %v", err)
		}
	}
	return successes, noRows
}

func billingTestDatabase(t *testing.T) *pgxpool.Pool {
	t.Helper()
	databaseURL := strings.TrimSpace(os.Getenv("INTEGRATION_DATABASE_URL"))
	if databaseURL == "" {
		t.Skip("INTEGRATION_DATABASE_URL is not configured")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		t.Fatalf("connect billing test database: %v", err)
	}
	t.Cleanup(db.Close)
	if err := db.Ping(ctx); err != nil {
		t.Fatalf("ping billing test database: %v", err)
	}
	return db
}

func insertBillingTestTeam(t *testing.T, db *pgxpool.Pool, balance int64) uuid.UUID {
	t.Helper()
	teamID := uuid.New()
	if _, err := db.Exec(context.Background(), `
		INSERT INTO teams (id, name, market_code)
		VALUES ($1, 'Billing Integration', 'GH')
	`, teamID); err != nil {
		t.Fatalf("insert billing test team: %v", err)
	}
	if _, err := db.Exec(context.Background(), `
		INSERT INTO team_wallets (team_id, currency, balance_units)
		VALUES ($1, 'GHS', $2)
	`, teamID, balance); err != nil {
		t.Fatalf("insert billing test wallet: %v", err)
	}
	t.Cleanup(func() {
		_, _ = db.Exec(context.Background(), `DELETE FROM wallet_ledger WHERE team_id = $1`, teamID)
		_, _ = db.Exec(context.Background(), `DELETE FROM email_allowance_usage WHERE team_id = $1`, teamID)
		_, _ = db.Exec(context.Background(), `DELETE FROM teams WHERE id = $1`, teamID)
	})
	return teamID
}

func assertEmailBillingState(
	t *testing.T,
	db *pgxpool.Pool,
	teamID uuid.UUID,
	wantBalance int64,
	wantAllowance int32,
	wantLedgerCount int,
	wantAllowanceUsageCount int,
) {
	t.Helper()
	var balance int64
	var allowance int32
	var ledgerCount, allowanceUsageCount int
	if err := db.QueryRow(context.Background(), `
		SELECT
			wallet.balance_units,
			wallet.free_email_allowance,
			(SELECT count(*) FROM wallet_ledger WHERE team_id = wallet.team_id),
			(SELECT count(*) FROM email_allowance_usage WHERE team_id = wallet.team_id)
		FROM team_wallets AS wallet
		WHERE wallet.team_id = $1
	`, teamID).Scan(&balance, &allowance, &ledgerCount, &allowanceUsageCount); err != nil {
		t.Fatalf("read email billing state: %v", err)
	}
	if balance != wantBalance || allowance != wantAllowance || ledgerCount != wantLedgerCount || allowanceUsageCount != wantAllowanceUsageCount {
		t.Fatalf(
			"email billing state: balance=%d allowance=%d ledger=%d allowance_usage=%d; want %d, %d, %d, %d",
			balance, allowance, ledgerCount, allowanceUsageCount,
			wantBalance, wantAllowance, wantLedgerCount, wantAllowanceUsageCount,
		)
	}
}

func assertBillingState(
	t *testing.T,
	db *pgxpool.Pool,
	teamID uuid.UUID,
	wantBalance int64,
	wantLedgerCount int,
	wantLedgerTotal int64,
) {
	t.Helper()
	var balance, ledgerTotal int64
	var ledgerCount int
	if err := db.QueryRow(context.Background(), `
		SELECT
			wallet.balance_units,
			count(ledger.id),
			COALESCE(sum(ledger.amount_units), 0)
		FROM team_wallets AS wallet
		LEFT JOIN wallet_ledger AS ledger ON ledger.team_id = wallet.team_id
		WHERE wallet.team_id = $1
		GROUP BY wallet.balance_units
	`, teamID).Scan(&balance, &ledgerCount, &ledgerTotal); err != nil {
		t.Fatalf("read billing state: %v", err)
	}
	if balance != wantBalance || ledgerCount != wantLedgerCount || ledgerTotal != wantLedgerTotal {
		t.Fatalf(
			"billing state: balance=%d ledger_count=%d ledger_total=%d; want %d, %d, %d",
			balance, ledgerCount, ledgerTotal, wantBalance, wantLedgerCount, wantLedgerTotal,
		)
	}
}
