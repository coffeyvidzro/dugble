ALTER TABLE webhook_deliveries
    ADD COLUMN IF NOT EXISTS replay_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_replayed_at TIMESTAMPTZ;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_webhook_deliveries_replay_count'
          AND conrelid = 'webhook_deliveries'::regclass
    ) THEN
        ALTER TABLE webhook_deliveries
            ADD CONSTRAINT chk_webhook_deliveries_replay_count
            CHECK (replay_count >= 0);
    END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS webhook_delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES webhook_deliveries(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    outcome TEXT NOT NULL,
    request_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_ms BIGINT,
    response_status INTEGER,
    response_headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    response_body TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_webhook_delivery_attempts_number
        UNIQUE (delivery_id, attempt_number),
    CONSTRAINT chk_webhook_delivery_attempts_number CHECK (attempt_number > 0),
    CONSTRAINT chk_webhook_delivery_attempts_outcome CHECK (outcome IN (
        'succeeded',
        'retryable_failure',
        'permanent_failure',
        'timeout',
        'network_error'
    )),
    CONSTRAINT chk_webhook_delivery_attempts_duration CHECK (
        duration_ms IS NULL OR duration_ms >= 0
    ),
    CONSTRAINT chk_webhook_delivery_attempts_response_status CHECK (
        response_status IS NULL OR response_status BETWEEN 100 AND 599
    ),
    CONSTRAINT chk_webhook_delivery_attempts_response_headers CHECK (
        jsonb_typeof(response_headers) = 'object'
    ),
    CONSTRAINT chk_webhook_delivery_attempts_completion CHECK (
        completed_at IS NULL OR completed_at >= started_at
    ),
    CONSTRAINT chk_webhook_delivery_attempts_outcome_fields CHECK (
        (outcome <> 'succeeded' OR response_status IS NOT NULL)
        AND (
            outcome NOT IN ('timeout', 'network_error')
            OR error_message IS NOT NULL
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_webhook_delivery_attempts_delivery_created
    ON webhook_delivery_attempts (delivery_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_delivery_attempts_outcome_created
    ON webhook_delivery_attempts (outcome, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_replayed
    ON webhook_deliveries (last_replayed_at DESC)
    WHERE replay_count > 0;
