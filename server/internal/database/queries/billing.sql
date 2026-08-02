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
WITH locked_wallet AS MATERIALIZED (
    SELECT wallet.*
    FROM team_wallets AS wallet
    WHERE wallet.team_id = sqlc.arg(team_id)
    FOR UPDATE
),
inserted_ledger AS (
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
    FROM locked_wallet AS wallet
    WHERE sqlc.arg(amount_units)::bigint > 0
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
WITH locked_wallet AS MATERIALIZED (
    SELECT wallet.*
    FROM team_wallets AS wallet
    WHERE wallet.team_id = sqlc.arg(team_id)
    FOR UPDATE
),
inserted_ledger AS (
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
    FROM locked_wallet AS wallet
    WHERE sqlc.arg(amount_units)::bigint > 0
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

-- name: AuthorizeSMSCharge :one
WITH billing_account AS MATERIALIZED (
    SELECT
        team.id AS team_id,
        team.market_code,
        wallet.currency,
        wallet.tier,
        wallet.balance_units,
        CASE
            WHEN team.market_code = sqlc.arg(destination_country) THEN 'sms_local'
            ELSE 'sms_intl'
        END AS product
    FROM teams AS team
    JOIN team_wallets AS wallet ON wallet.team_id = team.id
    WHERE team.id = sqlc.arg(team_id)
      AND team.status = 'active'
      AND team.market_code IN ('GH', 'KE')
    FOR UPDATE OF wallet
),
resolved_rate AS MATERIALIZED (
    SELECT
        account.*,
        rate.cost_units,
        rate.currency AS rate_currency,
        rate.cost_units * sqlc.arg(segments)::bigint AS amount_units
    FROM billing_account AS account
    JOIN product_rates AS rate
      ON rate.market_code = account.market_code
     AND rate.product = account.product
     AND rate.tier = account.tier
     AND rate.is_active = true
),
existing_ledger AS MATERIALIZED (
    SELECT ledger.id
    FROM wallet_ledger AS ledger
    JOIN billing_account AS account ON account.team_id = ledger.team_id
    WHERE ledger.transaction_type = 'usage_sms'
      AND ledger.reference_id = sqlc.arg(reference_id)
),
inserted_ledger AS (
    INSERT INTO wallet_ledger (
        team_id,
        amount_units,
        transaction_type,
        reference_id
    )
    SELECT
        rate.team_id,
        -rate.amount_units,
        'usage_sms',
        sqlc.arg(reference_id)
    FROM resolved_rate AS rate
    WHERE rate.currency = rate.rate_currency
      AND rate.currency = CASE rate.market_code
          WHEN 'GH' THEN 'GHS'
          WHEN 'KE' THEN 'KES'
      END
      AND rate.balance_units >= rate.amount_units
    ON CONFLICT (team_id, transaction_type, reference_id) DO NOTHING
    RETURNING team_id, amount_units
),
updated_wallet AS (
    UPDATE team_wallets AS wallet
    SET balance_units = wallet.balance_units + ledger.amount_units,
        updated_at = now()
    FROM inserted_ledger AS ledger
    WHERE wallet.team_id = ledger.team_id
    RETURNING wallet.balance_units
)
SELECT
    CASE
        WHEN NOT EXISTS (SELECT 1 FROM billing_account) THEN 'account_not_found'
        WHEN NOT EXISTS (SELECT 1 FROM resolved_rate) THEN 'rate_not_found'
        WHEN EXISTS (
            SELECT 1
            FROM resolved_rate
            WHERE currency <> rate_currency
               OR currency <> CASE market_code
                   WHEN 'GH' THEN 'GHS'
                   WHEN 'KE' THEN 'KES'
               END
        ) THEN 'currency_mismatch'
        WHEN EXISTS (SELECT 1 FROM existing_ledger) THEN 'already_applied'
        WHEN EXISTS (SELECT 1 FROM updated_wallet) THEN 'applied'
        WHEN EXISTS (
            SELECT 1 FROM resolved_rate
            WHERE balance_units < amount_units
        ) THEN 'insufficient_balance'
        ELSE 'already_applied'
    END AS outcome,
    COALESCE((SELECT market_code FROM resolved_rate), '')::text AS market_code,
    COALESCE((SELECT currency FROM resolved_rate), '')::text AS currency,
    COALESCE((SELECT tier FROM resolved_rate), '')::text AS tier,
    COALESCE((SELECT product FROM resolved_rate), '')::text AS product,
    COALESCE((SELECT cost_units FROM resolved_rate), 0)::bigint AS unit_cost_units,
    sqlc.arg(segments)::bigint AS quantity,
    COALESCE((SELECT amount_units FROM resolved_rate), 0)::bigint AS amount_units,
    COALESCE(
        (SELECT balance_units FROM updated_wallet),
        (SELECT balance_units FROM resolved_rate),
        0
    )::bigint AS balance_units;
