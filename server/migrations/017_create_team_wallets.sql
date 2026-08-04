CREATE TABLE IF NOT EXISTS team_wallets (
    team_id UUID PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
    currency CHAR(3) NOT NULL,
    balance_units BIGINT NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'growth',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_team_wallets_currency
        CHECK (currency IN ('GHS', 'KES')),
    CONSTRAINT chk_team_wallets_balance
        CHECK (balance_units >= 0),
    CONSTRAINT chk_team_wallets_tier
        CHECK (tier IN ('growth', 'scale', 'enterprise'))
);

CREATE TABLE IF NOT EXISTS wallet_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    usage_authorization_id UUID,
    amount_units BIGINT NOT NULL,
    transaction_type TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_wallet_ledger_reference
        UNIQUE (team_id, transaction_type, reference_id),

    CONSTRAINT chk_wallet_ledger_amount
        CHECK (amount_units <> 0),

    CONSTRAINT chk_wallet_ledger_transaction_type
        CHECK (
            transaction_type IN (
                'deposit',
                'usage_sms',
                'usage_email',
                'refund',
                'expiry_wipe'
            )
        ),

    CONSTRAINT chk_wallet_ledger_reference
        CHECK (length(trim(reference_id)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_team_created
    ON wallet_ledger (
        team_id,
        created_at DESC
    );
