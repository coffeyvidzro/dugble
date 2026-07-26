ALTER TABLE email_messages
    ADD COLUMN IF NOT EXISTS recipients JSONB NOT NULL DEFAULT '{"to":[],"cc":[],"bcc":[],"reply_to":[]}'::jsonb,
    ADD COLUMN IF NOT EXISTS headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

ALTER TABLE email_messages
    ADD CONSTRAINT chk_email_recipients_object CHECK (jsonb_typeof(recipients) = 'object'),
    ADD CONSTRAINT chk_email_headers_object CHECK (jsonb_typeof(headers) = 'object'),
    ADD CONSTRAINT chk_email_attachments_array CHECK (jsonb_typeof(attachments) = 'array'),
    ADD CONSTRAINT chk_email_tags_array CHECK (jsonb_typeof(tags) = 'array');

CREATE INDEX IF NOT EXISTS idx_email_messages_team_scheduled
    ON email_messages (team_id, scheduled_at)
    WHERE status = 'queued' AND scheduled_at IS NOT NULL;
