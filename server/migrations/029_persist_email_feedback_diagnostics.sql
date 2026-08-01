ALTER TABLE email_provider_events
    ADD COLUMN IF NOT EXISTS diagnostics JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS recipient_diagnostics JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE email_provider_events
    DROP CONSTRAINT IF EXISTS chk_email_provider_events_diagnostics,
    DROP CONSTRAINT IF EXISTS chk_email_provider_events_recipient_diagnostics;

ALTER TABLE email_provider_events
    ADD CONSTRAINT chk_email_provider_events_diagnostics
        CHECK (jsonb_typeof(diagnostics) = 'object'),
    ADD CONSTRAINT chk_email_provider_events_recipient_diagnostics
        CHECK (jsonb_typeof(recipient_diagnostics) = 'array');

UPDATE email_provider_events
SET diagnostics = jsonb_strip_nulls(jsonb_build_object(
    'bounce_type', NULLIF(normalized_payload ->> 'bounce_type', ''),
    'bounce_sub_type', NULLIF(normalized_payload ->> 'bounce_sub_type', ''),
    'complaint_feedback_type', NULLIF(normalized_payload ->> 'complaint_type', ''),
    'reject_reason', NULLIF(normalized_payload ->> 'reject_reason', ''),
    'failure_reason', NULLIF(normalized_payload ->> 'failure_reason', '')
))
WHERE diagnostics = '{}'::jsonb;

ALTER TABLE email_recipient_events
    ADD COLUMN IF NOT EXISTS action TEXT,
    ADD COLUMN IF NOT EXISTS status_code TEXT,
    ADD COLUMN IF NOT EXISTS diagnostic_code TEXT;

ALTER TABLE email_recipients
    ADD COLUMN IF NOT EXISTS last_action TEXT,
    ADD COLUMN IF NOT EXISTS last_status_code TEXT,
    ADD COLUMN IF NOT EXISTS last_diagnostic_code TEXT;

CREATE INDEX IF NOT EXISTS idx_email_provider_events_diagnostics
    ON email_provider_events USING GIN (diagnostics);

CREATE INDEX IF NOT EXISTS idx_email_recipient_events_status_code
    ON email_recipient_events (status_code)
    WHERE status_code IS NOT NULL;
