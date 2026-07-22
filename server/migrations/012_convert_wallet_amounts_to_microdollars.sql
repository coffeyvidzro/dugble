-- Wallet balances were initially stored in USD cents. Convert existing values to
-- USD microdollars so sub-cent SMS prices such as $0.006 remain exact.
UPDATE wallets
SET balance = balance * 10000;

UPDATE wallet_transactions
SET amount = amount * 10000,
    balance_after = balance_after * 10000;

COMMENT ON COLUMN wallets.balance IS
    'USD microdollars; 1 USD = 1,000,000 micros';

COMMENT ON COLUMN wallet_transactions.amount IS
    'Signed USD microdollars; positive credits and negative debits';

COMMENT ON COLUMN wallet_transactions.balance_after IS
    'Wallet balance in USD microdollars after this transaction';
