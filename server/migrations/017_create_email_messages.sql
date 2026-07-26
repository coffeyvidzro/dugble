CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(255),
    idempotency_hash CHAR(64),
    message_type TEXT NOT NULL DEFAULT 'transactional',
    from_email TEXT NOT NULL,
    from_name TEXT,
    reply_to_email TEXT,
    to_email TEXT NOT NULL,
    to_name TEXT,
    subject VARCHAR(255) NOT NULL,
    html_body TEXT,
    text_body TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    provider TEXT,
    provider_message_id TEXT,
    error_code TEXT,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processing_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_email_messages_idempotency_pair CHECK (
        (idempotency_key IS NULL AND idempotency_hash IS NULL)
        OR (idempotency_key IS NOT NULL AND idempotency_hash IS NOT NULL)
    ),
    CONSTRAINT chk_email_messages_type CHECK (message_type IN ('transactional')),
    CONSTRAINT chk_email_messages_from_email CHECK (length(trim(from_email)) > 0),
    CONSTRAINT chk_email_messages_to_email CHECK (length(trim(to_email)) > 0),
    CONSTRAINT chk_email_messages_subject CHECK (length(trim(subject)) > 0),
    CONSTRAINT chk_email_messages_body CHECK (
        (html_body IS NOT NULL AND length(trim(html_body)) > 0)
        OR (text_body IS NOT NULL AND length(trim(text_body)) > 0)
    ),
    CONSTRAINT chk_email_messages_metadata_object CHECK (jsonb_typeof(metadata) = 'object'),
    CONSTRAINT chk_email_messages_status CHECK (
        status IN ('queued', 'processing', 'submitted', 'delivered', 'delayed', 'bounced', 'complained', 'rejected', 'failed')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_email_messages_team_idempotency
    ON email_messages (team_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_messages_team_created
    ON email_messages (team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_messages_provider_message
    ON email_messages (provider, provider_message_id)
    WHERE provider IS NOT NULL AND provider_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_messages_status_queued
    ON email_messages (status, queued_at)
    WHERE status IN ('queued', 'processing', 'delayed');
