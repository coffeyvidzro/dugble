ALTER TABLE webhook_endpoints
    ADD COLUMN consecutive_failures INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN last_failure_at TIMESTAMPTZ,
    ADD COLUMN disabled_reason TEXT;

ALTER TABLE webhook_endpoints
    ADD CONSTRAINT chk_webhook_endpoint_consecutive_failures
        CHECK (consecutive_failures >= 0),
    ADD CONSTRAINT chk_webhook_endpoint_disabled_reason
        CHECK (disabled_reason IS NULL OR disabled_reason IN ('manual', 'failure_threshold'));
