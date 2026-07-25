CREATE TABLE IF NOT EXISTS sms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES sender_ids(id) ON DELETE SET NULL,
    to_number TEXT NOT NULL,
    from_name VARCHAR(11) NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    provider_id TEXT,
    provider_message_id TEXT,
    segments INTEGER NOT NULL DEFAULT 1,
    cost_micros BIGINT NOT NULL DEFAULT 0,
    error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    pricing_rule_id UUID NOT NULL,
    unit_cost_micros BIGINT NOT NULL DEFAULT 0,
    destination_country CHAR(2) NOT NULL,

    CONSTRAINT chk_sms_messages_to_number_not_empty
        CHECK (length(trim(to_number)) > 0),
    CONSTRAINT chk_sms_messages_from_name_not_empty
        CHECK (length(trim(from_name)) > 0),
    CONSTRAINT chk_sms_messages_body_not_empty
        CHECK (length(trim(body)) > 0),
    CONSTRAINT chk_sms_messages_segments_positive
        CHECK (segments > 0),
    CONSTRAINT chk_sms_messages_cost_non_negative
        CHECK (cost_micros >= 0),
    CONSTRAINT chk_sms_messages_unit_cost_non_negative
        CHECK (unit_cost_micros >= 0),
    CONSTRAINT chk_sms_messages_destination_country
        CHECK (destination_country ~ '^[A-Z]{2}$'),
    CONSTRAINT chk_sms_messages_status
        CHECK (status IN ('queued', 'processing', 'refund_pending', 'submitted', 'sent', 'delivered', 'undelivered', 'rejected', 'failed', 'expired', 'unknown'))
);

CREATE INDEX IF NOT EXISTS idx_sms_messages_team_created
    ON sms_messages (team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sms_messages_provider_message
    ON sms_messages (provider_id, provider_message_id)
    WHERE provider_id IS NOT NULL AND provider_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sms_messages_pricing_rule
    ON sms_messages (pricing_rule_id);

CREATE INDEX IF NOT EXISTS idx_sms_messages_destination_country
    ON sms_messages (destination_country, created_at DESC);
