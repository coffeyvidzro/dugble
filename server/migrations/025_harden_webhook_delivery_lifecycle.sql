ALTER TABLE webhook_deliveries
    DROP CONSTRAINT IF EXISTS chk_webhook_delivery_status;

ALTER TABLE webhook_deliveries
    ADD CONSTRAINT chk_webhook_delivery_status CHECK (
        status IN ('pending', 'retrying', 'succeeded', 'failed', 'canceled')
    );
