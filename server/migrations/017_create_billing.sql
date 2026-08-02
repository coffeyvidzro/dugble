CREATE TABLE IF NOT EXISTS team_wallets (
    team_id UUID PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
    currency CHAR(3) NOT NULL,
    balance_units BIGINT NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'growth',
    free_email_allowance INTEGER NOT NULL DEFAULT 1000,
    last_allowance_reset TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_team_wallets_currency
        CHECK (currency IN ('GHS', 'KES')),
    CONSTRAINT chk_team_wallets_balance
        CHECK (balance_units >= 0),
    CONSTRAINT chk_team_wallets_tier
        CHECK (tier IN ('growth', 'scale', 'enterprise')),
    CONSTRAINT chk_team_wallets_free_email_allowance
        CHECK (free_email_allowance >= 0)
);

CREATE TABLE IF NOT EXISTS product_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product TEXT NOT NULL,
    market_code CHAR(2) NOT NULL,
    tier TEXT NOT NULL,
    currency CHAR(3) NOT NULL,
    cost_units BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_product_rates_product_market_tier
        UNIQUE (product, market_code, tier),

    CONSTRAINT chk_product_rates_product
        CHECK (product IN ('sms_local', 'sms_intl', 'email')),

    CONSTRAINT chk_product_rates_market_code
        CHECK (market_code IN ('GH', 'KE')),

    CONSTRAINT chk_product_rates_tier
        CHECK (tier IN ('growth', 'scale', 'enterprise')),

    CONSTRAINT chk_product_rates_currency
        CHECK (currency IN ('GHS', 'KES')),

    CONSTRAINT chk_product_rates_cost
        CHECK (cost_units > 0)
);

CREATE TABLE IF NOT EXISTS wallet_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
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

CREATE INDEX IF NOT EXISTS idx_product_rates_lookup
    ON product_rates (
        market_code,
        product,
        tier
    )
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_team_created
    ON wallet_ledger (
        team_id,
        created_at DESC
    );
