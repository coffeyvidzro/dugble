package wallets

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrInsufficientBalance = errors.New("insufficient wallet balance")

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) List(ctx context.Context, filter Filter) ([]Row, error) {
	rows, err := r.db.Query(ctx, `
		SELECT w.id::text, w.team_id::text, t.name, w.currency, w.balance, w.status, w.updated_at
		FROM wallets w
		JOIN teams t ON t.id = w.team_id
		WHERE ($1 = '' OR t.name ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR w.status = $2)
		ORDER BY w.updated_at DESC
		LIMIT 100
	`, filter.Query, filter.Status)
	if err != nil {
		return nil, fmt.Errorf("list wallets: %w", err)
	}
	defer rows.Close()

	var wallets []Row
	for rows.Next() {
		var row Row
		if err := rows.Scan(&row.ID, &row.TeamID, &row.TeamName, &row.Currency, &row.Balance, &row.Status, &row.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan wallet: %w", err)
		}
		wallets = append(wallets, row)
	}

	return wallets, rows.Err()
}

func (r *Repository) Detail(ctx context.Context, id string) (Detail, error) {
	wallet, err := r.get(ctx, id)
	if err != nil {
		return Detail{}, err
	}

	transactions, err := r.Transactions(ctx, id)
	if err != nil {
		return Detail{}, err
	}

	return Detail{Wallet: wallet, Transactions: transactions}, nil
}

func (r *Repository) Transactions(ctx context.Context, id string) ([]TransactionRow, error) {
	rows, err := r.db.Query(ctx, `
		SELECT
			id::text,
			transaction_type,
			coalesce(reference_id::text, ''),
			amount,
			balance_after,
			status,
			coalesce(description, ''),
			coalesce(metadata::text, '{}'),
			created_at
		FROM wallet_transactions
		WHERE wallet_id = $1::uuid
		ORDER BY created_at DESC
		LIMIT 100
	`, id)
	if err != nil {
		return nil, fmt.Errorf("list wallet transactions: %w", err)
	}
	defer rows.Close()

	var transactions []TransactionRow
	for rows.Next() {
		var row TransactionRow
		if err := rows.Scan(&row.ID, &row.TransactionType, &row.ReferenceID, &row.Amount, &row.BalanceAfter, &row.Status, &row.Description, &row.Metadata, &row.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan wallet transaction: %w", err)
		}
		transactions = append(transactions, row)
	}

	return transactions, rows.Err()
}

func (r *Repository) Adjust(ctx context.Context, id string, amountMicros int64, reason string) error {
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("begin wallet adjustment: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var walletID string
	var teamID string
	var balance int64
	if err := tx.QueryRow(ctx, `
		SELECT id::text, team_id::text, balance
		FROM wallets
		WHERE id = $1::uuid
		FOR UPDATE
	`, id).Scan(&walletID, &teamID, &balance); err != nil {
		return fmt.Errorf("get wallet for adjustment: %w", err)
	}

	balanceAfter := balance + amountMicros
	if balanceAfter < 0 {
		return fmt.Errorf("adjust wallet: %w", ErrInsufficientBalance)
	}

	if _, err := tx.Exec(ctx, `
		UPDATE wallets
		SET balance = $2,
			updated_at = now()
		WHERE id = $1::uuid
	`, id, balanceAfter); err != nil {
		return fmt.Errorf("update wallet balance: %w", err)
	}

	if _, err := tx.Exec(ctx, `
		INSERT INTO wallet_transactions (
			wallet_id,
			team_id,
			transaction_type,
			amount,
			balance_after,
			status,
			description,
			metadata
		) VALUES (
			$1::uuid,
			$2::uuid,
			'adjustment',
			$3,
			$4,
			'completed',
			$5,
			'{}'::jsonb
		)
	`, walletID, teamID, amountMicros, balanceAfter, reason); err != nil {
		return fmt.Errorf("create wallet adjustment transaction: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit wallet adjustment: %w", err)
	}

	return nil
}

func (r *Repository) get(ctx context.Context, id string) (Row, error) {
	var wallet Row
	if err := r.db.QueryRow(ctx, `
		SELECT w.id::text, w.team_id::text, t.name, w.currency, w.balance, w.status, w.updated_at
		FROM wallets w
		JOIN teams t ON t.id = w.team_id
		WHERE w.id = $1::uuid
	`, id).Scan(&wallet.ID, &wallet.TeamID, &wallet.TeamName, &wallet.Currency, &wallet.Balance, &wallet.Status, &wallet.UpdatedAt); err != nil {
		return Row{}, fmt.Errorf("get wallet: %w", err)
	}

	return wallet, nil
}
