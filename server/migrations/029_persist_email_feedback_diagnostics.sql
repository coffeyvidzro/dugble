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

CREATE OR REPLACE FUNCTION project_email_provider_event_diagnostics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.diagnostics = COALESCE(NEW.normalized_payload -> 'diagnostics', '{}'::jsonb);
    NEW.recipient_diagnostics = COALESCE(NEW.normalized_payload -> 'recipient_diagnostics', '[]'::jsonb);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_project_email_provider_event_diagnostics ON email_provider_events;

CREATE TRIGGER trg_project_email_provider_event_diagnostics
BEFORE INSERT OR UPDATE OF normalized_payload ON email_provider_events
FOR EACH ROW
EXECUTE FUNCTION project_email_provider_event_diagnostics();

UPDATE email_provider_events
SET diagnostics = COALESCE(normalized_payload -> 'diagnostics', jsonb_strip_nulls(jsonb_build_object(
        'bounce_type', NULLIF(normalized_payload ->> 'bounce_type', ''),
        'bounce_sub_type', NULLIF(normalized_payload ->> 'bounce_sub_type', ''),
        'complaint_feedback_type', NULLIF(normalized_payload ->> 'complaint_type', ''),
        'reject_reason', NULLIF(normalized_payload ->> 'reject_reason', ''),
        'failure_reason', NULLIF(normalized_payload ->> 'failure_reason', '')
    ))),
    recipient_diagnostics = COALESCE(normalized_payload -> 'recipient_diagnostics', '[]'::jsonb);

ALTER TABLE email_recipient_events
    ADD COLUMN IF NOT EXISTS action TEXT,
    ADD COLUMN IF NOT EXISTS status_code TEXT,
    ADD COLUMN IF NOT EXISTS diagnostic_code TEXT;

ALTER TABLE email_recipients
    ADD COLUMN IF NOT EXISTS last_action TEXT,
    ADD COLUMN IF NOT EXISTS last_status_code TEXT,
    ADD COLUMN IF NOT EXISTS last_diagnostic_code TEXT;

CREATE OR REPLACE FUNCTION project_email_recipient_event_diagnostics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    diagnostic JSONB;
BEGIN
    SELECT item
    INTO diagnostic
    FROM email_provider_events AS provider_event
    CROSS JOIN LATERAL jsonb_array_elements(provider_event.recipient_diagnostics) AS item
    WHERE provider_event.id = NEW.email_provider_event_id
      AND lower(trim(item ->> 'email')) = lower(trim(NEW.recipient_email))
    LIMIT 1;

    IF diagnostic IS NOT NULL THEN
        NEW.action = NULLIF(trim(diagnostic ->> 'action'), '');
        NEW.status_code = NULLIF(trim(diagnostic ->> 'status_code'), '');
        NEW.diagnostic_code = NULLIF(trim(diagnostic ->> 'diagnostic_code'), '');
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_project_email_recipient_event_diagnostics ON email_recipient_events;

CREATE TRIGGER trg_project_email_recipient_event_diagnostics
BEFORE INSERT ON email_recipient_events
FOR EACH ROW
EXECUTE FUNCTION project_email_recipient_event_diagnostics();

CREATE OR REPLACE FUNCTION sync_email_recipient_current_diagnostics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE email_recipients
    SET last_action = NEW.action,
        last_status_code = NEW.status_code,
        last_diagnostic_code = NEW.diagnostic_code,
        updated_at = now()
    WHERE email_message_id = NEW.email_message_id
      AND recipient_email = lower(trim(NEW.recipient_email))
      AND (last_event_at IS NULL OR NEW.occurred_at >= last_event_at);

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_email_recipient_current_diagnostics ON email_recipient_events;

CREATE TRIGGER trg_sync_email_recipient_current_diagnostics
AFTER INSERT ON email_recipient_events
FOR EACH ROW
EXECUTE FUNCTION sync_email_recipient_current_diagnostics();

WITH projected AS (
    SELECT
        recipient_event.id,
        NULLIF(trim(item ->> 'action'), '') AS action,
        NULLIF(trim(item ->> 'status_code'), '') AS status_code,
        NULLIF(trim(item ->> 'diagnostic_code'), '') AS diagnostic_code
    FROM email_recipient_events AS recipient_event
    JOIN email_provider_events AS provider_event
      ON provider_event.id = recipient_event.email_provider_event_id
    CROSS JOIN LATERAL jsonb_array_elements(provider_event.recipient_diagnostics) AS item
    WHERE lower(trim(item ->> 'email')) = lower(trim(recipient_event.recipient_email))
)
UPDATE email_recipient_events AS recipient_event
SET action = projected.action,
    status_code = projected.status_code,
    diagnostic_code = projected.diagnostic_code
FROM projected
WHERE recipient_event.id = projected.id;

WITH latest AS (
    SELECT DISTINCT ON (email_message_id, recipient_email)
        email_message_id,
        recipient_email,
        action,
        status_code,
        diagnostic_code
    FROM email_recipient_events
    ORDER BY email_message_id, recipient_email, occurred_at DESC, created_at DESC
)
UPDATE email_recipients AS recipient
SET last_action = latest.action,
    last_status_code = latest.status_code,
    last_diagnostic_code = latest.diagnostic_code,
    updated_at = now()
FROM latest
WHERE recipient.email_message_id = latest.email_message_id
  AND recipient.recipient_email = latest.recipient_email;

CREATE INDEX IF NOT EXISTS idx_email_provider_events_diagnostics
    ON email_provider_events USING GIN (diagnostics);

CREATE INDEX IF NOT EXISTS idx_email_recipient_events_status_code
    ON email_recipient_events (status_code)
    WHERE status_code IS NOT NULL;
