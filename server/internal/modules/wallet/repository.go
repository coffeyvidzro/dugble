package wallet

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

type Repository struct {
	db      *pgxpool.Pool
	queries *dbsqlc.Queries
}

func NewRepository(db *pgxpool.Pool) *Repository { return &Repository{db: db, queries: dbsqlc.New(db)} }

func (r *Repository) Create(ctx context.Context, teamID uuid.UUID, currency string) (Wallet, error) {
	row, err := r.queries.CreateWallet(ctx, dbsqlc.CreateWalletParams{TeamID: teamID, Currency: currency})
	if err != nil {
		return Wallet{}, fmt.Errorf("create wallet: %w", err)
	}
	return walletFromSQLC(row), nil
}

func (r *Repository) GetByTeam(ctx context.Context, teamID uuid.UUID, currency string) (Wallet, error) {
	row, err := r.queries.GetWalletByTeamAndCurrency(ctx, dbsqlc.GetWalletByTeamAndCurrencyParams{TeamID: teamID, Currency: currency})
	if err != nil {
		return Wallet{}, fmt.Errorf("get wallet: %w", err)
	}
	return walletFromSQLC(row), nil
}

func (r *Repository) Credit(ctx context.Context, teamID uuid.UUID, amount int64, referenceID *uuid.UUID, description *string, metadata json.RawMessage) (Wallet, Transaction, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Wallet{}, Transaction{}, fmt.Errorf("begin wallet transaction: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	q := r.queries.WithTx(tx)
	wallet, err := q.CreateWallet(ctx, dbsqlc.CreateWalletParams{TeamID: teamID, Currency: CurrencyUSD})
	if err != nil {
		return Wallet{}, Transaction{}, fmt.Errorf("create wallet: %w", err)
	}
	updated, err := q.CreditWallet(ctx, dbsqlc.CreditWalletParams{ID: wallet.ID, Amount: amount})
	if err != nil {
		return Wallet{}, Transaction{}, fmt.Errorf("credit wallet: %w", err)
	}
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}
	transaction, err := q.CreateWalletTransaction(ctx, dbsqlc.CreateWalletTransactionParams{
		WalletID: updated.ID, TeamID: teamID, TransactionType: TransactionTopUp, ReferenceID: referenceID,
		Amount: amount, BalanceAfter: updated.Balance, Status: TransactionStatusCompleted, Description: description, Metadata: metadata,
	})
	if err != nil {
		return Wallet{}, Transaction{}, fmt.Errorf("create wallet transaction: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Wallet{}, Transaction{}, fmt.Errorf("commit wallet transaction: %w", err)
	}
	return walletFromSQLC(updated), transactionFromSQLC(transaction), nil
}

func (r *Repository) ListTransactions(ctx context.Context, teamID uuid.UUID, limit, offset int32) ([]Transaction, error) {
	rows, err := r.queries.ListTeamWalletTransactions(ctx, dbsqlc.ListTeamWalletTransactionsParams{TeamID: teamID, LimitCount: limit, OffsetCount: offset})
	if err != nil {
		return nil, fmt.Errorf("list wallet transactions: %w", err)
	}
	transactions := make([]Transaction, 0, len(rows))
	for _, row := range rows {
		transactions = append(transactions, transactionFromSQLC(row))
	}
	return transactions, nil
}

func walletFromSQLC(row dbsqlc.Wallet) Wallet {
	return Wallet{ID: row.ID.String(), TeamID: row.TeamID.String(), Currency: row.Currency, Balance: row.Balance, Status: row.Status, CreatedAt: row.CreatedAt.Time, UpdatedAt: row.UpdatedAt.Time}
}

func transactionFromSQLC(row dbsqlc.WalletTransaction) Transaction {
	var ref *string
	if row.ReferenceID != nil {
		v := row.ReferenceID.String()
		ref = &v
	}
	metadata := json.RawMessage(row.Metadata)
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}
	return Transaction{ID: row.ID.String(), WalletID: row.WalletID.String(), TeamID: row.TeamID.String(), TransactionType: row.TransactionType, ReferenceID: ref, Amount: row.Amount, BalanceAfter: row.BalanceAfter, Status: row.Status, Description: row.Description, Metadata: metadata, CreatedAt: row.CreatedAt.Time}
}
