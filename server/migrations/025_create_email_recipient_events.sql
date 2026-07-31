CREATE TABLE IF NOT EXISTS email_recipient_events (
    id UUID PRIMARY KEY,
    email_provider_event_id UUID NOT NULL REFERENCES email_provider_events(id) ON DELETE CASCADE,
    email_message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    event_type TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_email_recipient_events_provider_recipient
        UNIQUE (email_provider_event_id, recipient_email),
    CONSTRAINT chk_email_recipient_events_recipient
        CHECK (length(trim(recipient_email)) > 0),
    CONSTRAINT chk_email_recipient_events_type CHECK (event_type IN (
        'send', 'delivery', 'delivery_delay', 'bounce', 'complaint', 'reject', 'rendering_failure'
    ))
);

CREATE INDEX IF NOT EXISTS idx_email_recipient_events_message_recipient
    ON email_recipient_events (email_message_id, recipient_email, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_recipient_events_recipient_occurred
    ON email_recipient_events (recipient_email, occurred_at DESC);
