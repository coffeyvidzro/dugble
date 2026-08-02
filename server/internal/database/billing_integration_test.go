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
		_, _ = db.Exec(context.Background(), `DELETE FROM teams WHERE id = $1`, teamID)
	})
	return teamID
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
