-- name: CreateWallet :one
INSERT INTO wallets (
    team_id,
    currency
) VALUES (
    sqlc.arg(team_id),
    sqlc.arg(currency)
)
ON CONFLICT (team_id, currency) DO UPDATE
SET updated_at = wallets.updated_at
RETURNING *;

-- name: GetWallet :one
SELECT *
FROM wallets
WHERE id = sqlc.arg(id);

-- name: GetWalletByTeamAndCurrency :one
SELECT *
FROM wallets
WHERE team_id = sqlc.arg(team_id)
  AND currency = sqlc.arg(currency);

-- name: GetWalletByTeamAndCurrencyForUpdate :one
SELECT *
FROM wallets
WHERE team_id = sqlc.arg(team_id)
  AND currency = sqlc.arg(currency)
FOR UPDATE;

-- name: CreditWallet :one
UPDATE wallets
SET balance = balance + sqlc.arg(amount),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND status = 'active'
  AND sqlc.arg(amount) > 0
RETURNING *;

-- name: DebitWallet :one
UPDATE wallets
SET balance = balance - sqlc.arg(amount),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND status = 'active'
  AND sqlc.arg(amount) > 0
  AND balance >= sqlc.arg(amount)
RETURNING *;

-- name: UpdateWalletStatus :one
UPDATE wallets
SET status = sqlc.arg(status),
    updated_at = now()
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: CreateWalletTransaction :one
INSERT INTO wallet_transactions (
    wallet_id,
    team_id,
    transaction_type,
    reference_id,
    amount,
    balance_after,
    status,
    description,
    metadata
) VALUES (
    sqlc.arg(wallet_id),
    sqlc.arg(team_id),
    sqlc.arg(transaction_type),
    sqlc.arg(reference_id),
    sqlc.arg(amount),
    sqlc.arg(balance_after),
    sqlc.arg(status),
    sqlc.arg(description),
    sqlc.arg(metadata)
)
RETURNING *;

-- name: GetWalletTransaction :one
SELECT *
FROM wallet_transactions
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id);

-- name: ListWalletTransactions :many
SELECT *
FROM wallet_transactions
WHERE team_id = sqlc.arg(team_id)
  AND wallet_id = sqlc.arg(wallet_id)
ORDER BY created_at DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: ListTeamWalletTransactions :many
SELECT *
FROM wallet_transactions
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: GetWalletTransactionByReferenceForUpdate :one
SELECT *
FROM wallet_transactions
WHERE reference_id = sqlc.arg(reference_id)
FOR UPDATE;

-- name: UpdateWalletTransactionSettlement :one
UPDATE wallet_transactions
SET status = sqlc.arg(status),
    balance_after = sqlc.arg(balance_after),
    metadata = sqlc.arg(metadata)
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: UpdateWalletTransactionMetadata :one
UPDATE wallet_transactions
SET metadata = sqlc.arg(metadata)
WHERE id = sqlc.arg(id)
  AND status = 'pending'
RETURNING *;

-- name: GetCompletedWalletRefundByReference :one
SELECT *
FROM wallet_transactions
WHERE team_id = sqlc.arg(team_id)
  AND transaction_type = 'refund'
  AND reference_id = sqlc.arg(reference_id)
  AND status = 'completed'
ORDER BY created_at DESC
LIMIT 1;
