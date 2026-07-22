CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    balance BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_wallets_team_currency
        UNIQUE (team_id, currency),

    CONSTRAINT chk_wallets_balance
        CHECK (balance >= 0),

    CONSTRAINT chk_wallets_currency
        CHECK (currency = 'USD'),

    CONSTRAINT chk_wallets_status
        CHECK (status IN ('active', 'suspended', 'frozen'))
);

CREATE INDEX IF NOT EXISTS idx_wallets_team_id
    ON wallets (team_id);


CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL,
    reference_id UUID,

    -- Positive for credits, negative for debits.
    amount BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',

    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_wallet_transactions_type
        CHECK (transaction_type IN ('topup', 'sms_charge', 'refund', 'adjustment')),

    CONSTRAINT chk_wallet_transactions_amount
        CHECK (amount <> 0),

    CONSTRAINT chk_wallet_transactions_balance
        CHECK (balance_after >= 0),

    CONSTRAINT chk_wallet_transactions_status
        CHECK (status IN ('pending', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_created
    ON wallet_transactions (wallet_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_team_created
    ON wallet_transactions (team_id, created_at DESC);
