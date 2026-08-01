ALTER TABLE email_provider_events
    ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS last_error TEXT,
    ADD COLUMN IF NOT EXISTS dead_lettered_at TIMESTAMPTZ;

ALTER TABLE email_provider_events
    DROP CONSTRAINT IF EXISTS chk_email_provider_events_attempt_count;

ALTER TABLE email_provider_events
    ADD CONSTRAINT chk_email_provider_events_attempt_count
        CHECK (attempt_count >= 0);

UPDATE email_provider_events
SET next_attempt_at = received_at
WHERE processed_at IS NULL
  AND dead_lettered_at IS NULL
  AND next_attempt_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_email_provider_events_reconcile_due
    ON email_provider_events (next_attempt_at, id)
    WHERE processed_at IS NULL
      AND dead_lettered_at IS NULL
      AND next_attempt_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_provider_events_dead_lettered
    ON email_provider_events (dead_lettered_at DESC)
    WHERE dead_lettered_at IS NOT NULL;
