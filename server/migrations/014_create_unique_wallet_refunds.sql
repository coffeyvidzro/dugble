CREATE UNIQUE INDEX IF NOT EXISTS uq_wallet_transactions_sms_refund_reference
    ON wallet_transactions (team_id, transaction_type, reference_id)
    WHERE reference_id IS NOT NULL
      AND transaction_type = 'refund';
