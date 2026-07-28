ALTER TABLE email_messages
    ADD COLUMN sender_domain_id UUID REFERENCES sender_domains(id) ON DELETE SET NULL,
    ADD COLUMN delivery_provider TEXT NOT NULL DEFAULT 'aws_ses',
    ADD COLUMN provider_region TEXT NOT NULL DEFAULT 'us-east-1';

ALTER TABLE email_messages
    ADD CONSTRAINT chk_email_delivery_provider_present
        CHECK (length(trim(delivery_provider)) > 0),
    ADD CONSTRAINT chk_email_provider_region_present
        CHECK (length(trim(provider_region)) > 0);

CREATE INDEX idx_email_messages_sender_domain
    ON email_messages (sender_domain_id)
    WHERE sender_domain_id IS NOT NULL;
