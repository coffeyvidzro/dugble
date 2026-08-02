-- name: GetTeamWallet :one
SELECT *
FROM team_wallets
WHERE team_id = sqlc.arg(team_id);

-- name: GetActiveProductRate :one
SELECT *
FROM product_rates
WHERE market_code = sqlc.arg(market_code)
  AND product = sqlc.arg(product)
  AND tier = sqlc.arg(tier)
  AND is_active = true;

-- name: ListWalletLedger :many
SELECT *
FROM wallet_ledger
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC, id DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: CreditTeamWallet :one
WITH inserted_ledger AS (
    INSERT INTO wallet_ledger (
        team_id,
        amount_units,
        transaction_type,
        reference_id
    )
    SELECT
        wallet.team_id,
        sqlc.arg(amount_units),
        sqlc.arg(transaction_type),
        sqlc.arg(reference_id)
    FROM team_wallets AS wallet
    WHERE wallet.team_id = sqlc.arg(team_id)
      AND sqlc.arg(amount_units)::bigint > 0
    ON CONFLICT (team_id, transaction_type, reference_id) DO NOTHING
    RETURNING team_id, amount_units
),
updated_wallet AS (
    UPDATE team_wallets AS wallet
    SET balance_units = wallet.balance_units + ledger.amount_units,
        updated_at = now()
    FROM inserted_ledger AS ledger
    WHERE wallet.team_id = ledger.team_id
    RETURNING wallet.*
)
SELECT *
FROM updated_wallet;

-- name: DebitTeamWallet :one
WITH inserted_ledger AS (
    INSERT INTO wallet_ledger (
        team_id,
        amount_units,
        transaction_type,
        reference_id
    )
    SELECT
        wallet.team_id,
        -sqlc.arg(amount_units)::bigint,
        sqlc.arg(transaction_type),
        sqlc.arg(reference_id)
    FROM team_wallets AS wallet
    WHERE wallet.team_id = sqlc.arg(team_id)
      AND sqlc.arg(amount_units)::bigint > 0
      AND wallet.balance_units >= sqlc.arg(amount_units)
    ON CONFLICT (team_id, transaction_type, reference_id) DO NOTHING
    RETURNING team_id, amount_units
),
updated_wallet AS (
    UPDATE team_wallets AS wallet
    SET balance_units = wallet.balance_units + ledger.amount_units,
        updated_at = now()
    FROM inserted_ledger AS ledger
    WHERE wallet.team_id = ledger.team_id
    RETURNING wallet.*
)
SELECT *
FROM updated_wallet;

-- name: ConsumeFreeEmailAllowance :one
UPDATE team_wallets
SET free_email_allowance = free_email_allowance - 1,
    updated_at = now()
WHERE team_id = sqlc.arg(team_id)
  AND free_email_allowance > 0
RETURNING *;

-- name: ResetFreeEmailAllowance :one
UPDATE team_wallets
SET free_email_allowance = sqlc.arg(free_email_allowance),
    last_allowance_reset = now(),
    updated_at = now()
WHERE team_id = sqlc.arg(team_id)
  AND sqlc.arg(free_email_allowance)::integer >= 0
RETURNING *;

-- name: UpdateTeamWalletTier :one
UPDATE team_wallets
SET tier = sqlc.arg(tier),
    updated_at = now()
WHERE team_id = sqlc.arg(team_id)
RETURNING *;
