package wallet

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	dbsqlc "github.com/coffeyvidzro/dugble/server/internal/database/sqlc"
)

var (
	ErrWalletNotFound      = errors.New("wallet not found")
	ErrInsufficientBalance = errors.New("insufficient wallet balance")
	ErrInvalidWalletAmount = errors.New("invalid wallet amount")
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
		if errors.Is(err, pgx.ErrNoRows) {
			return Wallet{}, ErrWalletNotFound
		}
		return Wallet{}, fmt.Errorf("get wallet: %w", err)
	}
	return walletFromSQLC(row), nil
}

func (r *Repository) CreatePendingTopUp(ctx context.Context, teamID uuid.UUID, amountMicros int64, referenceID uuid.UUID, description *string, metadata json.RawMessage) (Transaction, error) {
	wallet, err := r.Create(ctx, teamID, CurrencyUSD)
	if err != nil {
		return Transaction{}, err
	}
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}
	transaction, err := r.queries.CreateWalletTransaction(ctx, dbsqlc.CreateWalletTransactionParams{
		WalletID:        uuid.MustParse(wallet.ID),
		TeamID:          teamID,
		TransactionType: TransactionTopUp,
		ReferenceID:     &referenceID,
		Amount:          amountMicros,
		BalanceAfter:    wallet.BalanceMicros,
		Status:          TransactionStatusPending,
		Description:     description,
		Metadata:        metadata,
	})
	if err != nil {
		return Transaction{}, fmt.Errorf("create pending top-up transaction: %w", err)
	}
	return transactionFromSQLC(transaction), nil
}

func (r *Repository) UpdateTransactionMetadata(ctx context.Context, id uuid.UUID, metadata json.RawMessage) (Transaction, error) {
	transaction, err := r.queries.UpdateWalletTransactionMetadata(ctx, dbsqlc.UpdateWalletTransactionMetadataParams{ID: id, Metadata: metadata})
	if err != nil {
		return Transaction{}, fmt.Errorf("update wallet transaction metadata: %w", err)
	}
	return transactionFromSQLC(transaction), nil
}

func (r *Repository) GetTopUpByReference(ctx context.Context, referenceID uuid.UUID) (Transaction, error) {
	transaction, err := r.queries.GetWalletTransactionByReferenceForUpdate(ctx, dbsqlc.GetWalletTransactionByReferenceForUpdateParams{ReferenceID: &referenceID})
	if err != nil {
		return Transaction{}, fmt.Errorf("get wallet top-up by reference: %w", err)
	}
	if transaction.TransactionType != TransactionTopUp {
		return Transaction{}, fmt.Errorf("wallet transaction %s is not a top-up", transaction.ID)
	}
	return transactionFromSQLC(transaction), nil
}

func (r *Repository) MarkTopUpFailed(ctx context.Context, id uuid.UUID, balanceAfterMicros int64, metadata json.RawMessage) (Transaction, error) {
	transaction, err := r.queries.UpdateWalletTransactionSettlement(ctx, dbsqlc.UpdateWalletTransactionSettlementParams{
		ID:           id,
		Status:       TransactionStatusFailed,
		BalanceAfter: balanceAfterMicros,
		Metadata:     metadata,
	})
	if err != nil {
		return Transaction{}, fmt.Errorf("mark top-up failed: %w", err)
	}
	return transactionFromSQLC(transaction), nil
}

func (r *Repository) SettleTopUp(ctx context.Context, referenceID uuid.UUID, paid bool, metadata json.RawMessage) (Transaction, error) {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Transaction{}, fmt.Errorf("begin top-up settlement: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	q := r.queries.WithTx(tx)
	pending, err := q.GetWalletTransactionByReferenceForUpdate(ctx, dbsqlc.GetWalletTransactionByReferenceForUpdateParams{ReferenceID: &referenceID})
	if err != nil {
		return Transaction{}, fmt.Errorf("get pending top-up: %w", err)
	}
	if pending.Status == TransactionStatusCompleted || pending.Status == TransactionStatusFailed {
		return transactionFromSQLC(pending), nil
	}

	status := TransactionStatusPending
	balanceAfter := pending.BalanceAfter
	if paid {
		updatedWallet, err := q.CreditWallet(ctx, dbsqlc.CreditWalletParams{ID: pending.WalletID, Amount: pending.Amount})
		if err != nil {
			return Transaction{}, fmt.Errorf("credit settled top-up: %w", err)
		}
		status = TransactionStatusCompleted
		balanceAfter = updatedWallet.Balance
	}
	settled, err := q.UpdateWalletTransactionSettlement(ctx, dbsqlc.UpdateWalletTransactionSettlementParams{
		ID:           pending.ID,
		Status:       status,
		BalanceAfter: balanceAfter,
		Metadata:     metadata,
	})
	if err != nil {
		return Transaction{}, fmt.Errorf("update top-up settlement: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Transaction{}, fmt.Errorf("commit top-up settlement: %w", err)
	}
	return transactionFromSQLC(settled), nil
}

func (r *Repository) Credit(ctx context.Context, teamID uuid.UUID, amountMicros int64, referenceID *uuid.UUID, description *string, metadata json.RawMessage) (Wallet, Transaction, error) {
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
	updated, err := q.CreditWallet(ctx, dbsqlc.CreditWalletParams{ID: wallet.ID, Amount: amountMicros})
	if err != nil {
		return Wallet{}, Transaction{}, fmt.Errorf("credit wallet: %w", err)
	}
	if len(metadata) == 0 {
		metadata = json.RawMessage(`{}`)
	}
	transaction, err := q.CreateWalletTransaction(ctx, dbsqlc.CreateWalletTransactionParams{
		WalletID: updated.ID, TeamID: teamID, TransactionType: TransactionTopUp, ReferenceID: referenceID,
		Amount: amountMicros, BalanceAfter: updated.Balance, Status: TransactionStatusCompleted, Description: description, Metadata: metadata,
	})
	if err != nil {
		return Wallet{}, Transaction{}, fmt.Errorf("create wallet transaction: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Wallet{}, Transaction{}, fmt.Errorf("commit wallet transaction: %w", err)
	}
	return walletFromSQLC(updated), transactionFromSQLC(transaction), nil
}

func (r *Repository) DebitSMSCharge(ctx context.Context, teamID uuid.UUID, amountMicros int64, referenceID uuid.UUID, metadata json.RawMessage) (Transaction, error) {
	if amountMicros <= 0 {
		return Transaction{}, ErrInvalidWalletAmount
	}

	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Transaction{}, fmt.Errorf("begin SMS wallet debit: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	q := r.queries.WithTx(tx)
	wallet, err := q.CreateWallet(ctx, dbsqlc.CreateWalletParams{TeamID: teamID, Currency: CurrencyUSD})
	if err != nil {
		return Transaction{}, fmt.Errorf("create SMS wallet: %w", err)
	}
	updated, err := q.DebitWallet(ctx, dbsqlc.DebitWalletParams{ID: wallet.ID, Amount: amountMicros})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return Transaction{}, ErrInsufficientBalance
		}
		return Transaction{}, fmt.Errorf("debit SMS wallet: %w", err)
	}
	metadata = ensureMetadata(metadata)
	description := "SMS charge"
	transaction, err := q.CreateWalletTransaction(ctx, dbsqlc.CreateWalletTransactionParams{
		WalletID:        updated.ID,
		TeamID:          teamID,
		TransactionType: TransactionSMSCharge,
		ReferenceID:     &referenceID,
		Amount:          -amountMicros,
		BalanceAfter:    updated.Balance,
		Status:          TransactionStatusCompleted,
		Description:     &description,
		Metadata:        metadata,
	})
	if err != nil {
		return Transaction{}, fmt.Errorf("create SMS charge transaction: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Transaction{}, fmt.Errorf("commit SMS wallet debit: %w", err)
	}
	return transactionFromSQLC(transaction), nil
}

func (r *Repository) RefundSMSCharge(ctx context.Context, teamID uuid.UUID, amountMicros int64, referenceID uuid.UUID, metadata json.RawMessage) (Transaction, error) {
	if amountMicros <= 0 {
		return Transaction{}, ErrInvalidWalletAmount
	}

	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return Transaction{}, fmt.Errorf("begin SMS wallet refund: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	q := r.queries.WithTx(tx)
	wallet, err := q.CreateWallet(ctx, dbsqlc.CreateWalletParams{TeamID: teamID, Currency: CurrencyUSD})
	if err != nil {
		return Transaction{}, fmt.Errorf("create SMS refund wallet: %w", err)
	}
	updated, err := q.CreditWallet(ctx, dbsqlc.CreditWalletParams{ID: wallet.ID, Amount: amountMicros})
	if err != nil {
		return Transaction{}, fmt.Errorf("credit SMS refund: %w", err)
	}
	metadata = ensureMetadata(metadata)
	description := "SMS refund"
	transaction, err := q.CreateWalletTransaction(ctx, dbsqlc.CreateWalletTransactionParams{
		WalletID:        updated.ID,
		TeamID:          teamID,
		TransactionType: TransactionRefund,
		ReferenceID:     &referenceID,
		Amount:          amountMicros,
		BalanceAfter:    updated.Balance,
		Status:          TransactionStatusCompleted,
		Description:     &description,
		Metadata:        metadata,
	})
	if err != nil {
		return Transaction{}, fmt.Errorf("create SMS refund transaction: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return Transaction{}, fmt.Errorf("commit SMS wallet refund: %w", err)
	}
	return transactionFromSQLC(transaction), nil
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
	return Wallet{ID: row.ID.String(), TeamID: row.TeamID.String(), Currency: row.Currency, BalanceMicros: row.Balance, Status: row.Status, CreatedAt: row.CreatedAt.Time, UpdatedAt: row.UpdatedAt.Time}
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
	return Transaction{ID: row.ID.String(), WalletID: row.WalletID.String(), TeamID: row.TeamID.String(), TransactionType: row.TransactionType, ReferenceID: ref, AmountMicros: row.Amount, BalanceAfterMicros: row.BalanceAfter, Status: row.Status, Description: row.Description, Metadata: metadata, CreatedAt: row.CreatedAt.Time}
}

func ensureMetadata(metadata json.RawMessage) json.RawMessage {
	if len(metadata) == 0 {
		return json.RawMessage(`{}`)
	}
	return metadata
}
