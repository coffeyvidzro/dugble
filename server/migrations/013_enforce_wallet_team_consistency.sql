DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uq_wallets_id_team'
          AND conrelid = 'wallets'::regclass
    ) THEN
        ALTER TABLE wallets
            ADD CONSTRAINT uq_wallets_id_team
            UNIQUE (id, team_id);
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_wallet_transactions_wallet_team'
          AND conrelid = 'wallet_transactions'::regclass
    ) THEN
        ALTER TABLE wallet_transactions
            ADD CONSTRAINT fk_wallet_transactions_wallet_team
            FOREIGN KEY (wallet_id, team_id)
            REFERENCES wallets (id, team_id)
            ON DELETE CASCADE;
    END IF;
END
$$;
