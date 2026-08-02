ALTER TABLE email_provider_events
    DROP CONSTRAINT IF EXISTS chk_email_provider_events_type;

ALTER TABLE email_provider_events
    ADD CONSTRAINT chk_email_provider_events_type CHECK (event_type IN (
        'send',
        'delivery',
        'delivery_delay',
        'bounce',
        'complaint',
        'reject',
        'rendering_failure',
        'open',
        'click',
        'subscription'
    ));

ALTER TABLE email_messages
    DROP CONSTRAINT IF EXISTS chk_email_message_type;

ALTER TABLE email_messages
    ADD CONSTRAINT chk_email_message_type CHECK (
        message_type IN ('transactional', 'marketing')
    );
