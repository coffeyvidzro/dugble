CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    message_type TEXT NOT NULL DEFAULT 'transactional',
    from_email TEXT NOT NULL,
    from_name TEXT,
    reply_to_email TEXT,
    to_email TEXT NOT NULL,
    to_name TEXT,
    subject TEXT NOT NULL,
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

    CONSTRAINT chk_email_body_present CHECK (html_body IS NOT NULL OR text_body IS NOT NULL),
    CONSTRAINT chk_email_message_type CHECK (message_type = 'transactional'),
    CONSTRAINT chk_email_status CHECK (status IN (
        'queued', 'processing', 'submitted', 'delivered', 'delayed',
        'bounced', 'complained', 'rejected', 'failed'
    )),
    CONSTRAINT chk_email_metadata_object CHECK (jsonb_typeof(metadata) = 'object'),
    CONSTRAINT chk_email_from_present CHECK (length(trim(from_email)) > 0),
    CONSTRAINT chk_email_to_present CHECK (length(trim(to_email)) > 0),
    CONSTRAINT chk_email_subject_present CHECK (length(trim(subject)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_email_messages_team_created
    ON email_messages (team_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_messages_provider_message
    ON email_messages (provider, provider_message_id)
    WHERE provider IS NOT NULL AND provider_message_id IS NOT NULL;
