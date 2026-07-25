CREATE TABLE sms_pricing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    is_default BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_sms_pricing_plans_name UNIQUE (name),
    CONSTRAINT chk_sms_pricing_plans_currency CHECK (currency = 'USD'),
    CONSTRAINT chk_sms_pricing_plans_status CHECK (status IN ('active', 'archived'))
);

CREATE UNIQUE INDEX uq_sms_pricing_plans_default
    ON sms_pricing_plans (is_default)
    WHERE is_default = true AND status = 'active';

CREATE TABLE sms_pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricing_plan_id UUID NOT NULL REFERENCES sms_pricing_plans(id) ON DELETE RESTRICT,
    destination_country CHAR(2) NOT NULL,
    unit_cost_micros BIGINT NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_until TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_sms_pricing_rules_destination_country
        CHECK (destination_country ~ '^[A-Z]{2}$'),
    CONSTRAINT chk_sms_pricing_rules_unit_cost CHECK (unit_cost_micros > 0),
    CONSTRAINT chk_sms_pricing_rules_effective_range CHECK (
        effective_until IS NULL OR effective_until > effective_from
    ),
    CONSTRAINT chk_sms_pricing_rules_status CHECK (status IN ('active', 'archived'))
);

CREATE INDEX idx_sms_pricing_rules_lookup
    ON sms_pricing_rules (
        pricing_plan_id,
        destination_country,
        status,
        effective_from DESC
    );

CREATE TABLE team_sms_settings (
    team_id UUID PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
    pricing_plan_id UUID NOT NULL REFERENCES sms_pricing_plans(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO sms_pricing_plans (
    id,
    name,
    currency,
    is_default,
    status
) VALUES (
    '9f6cb7f6-1a21-4a79-9aa8-9782c867a001',
    'Standard',
    'USD',
    true,
    'active'
);

INSERT INTO sms_pricing_rules (
    id,
    pricing_plan_id,
    destination_country,
    unit_cost_micros,
    effective_from,
    status
) VALUES (
    '9f6cb7f6-1a21-4a79-9aa8-9782c867a101',
    '9f6cb7f6-1a21-4a79-9aa8-9782c867a001',
    'GH',
    9000,
    '1970-01-01T00:00:00Z',
    'active'
);

-- sms_messages is created in migration 012, before the pricing tables exist.
-- Add its final pricing columns now that sms_pricing_rules can be referenced.
ALTER TABLE sms_messages
    ADD COLUMN destination_country CHAR(2) NOT NULL,
    ADD COLUMN pricing_rule_id UUID NOT NULL,
    ADD COLUMN unit_cost_micros BIGINT NOT NULL DEFAULT 0,
    ADD CONSTRAINT fk_sms_messages_pricing_rule
        FOREIGN KEY (pricing_rule_id)
        REFERENCES sms_pricing_rules(id)
        ON DELETE RESTRICT,
    ADD CONSTRAINT chk_sms_messages_destination_country
        CHECK (destination_country ~ '^[A-Z]{2}$'),
    ADD CONSTRAINT chk_sms_messages_unit_cost_non_negative
        CHECK (unit_cost_micros >= 0);

CREATE INDEX idx_sms_messages_pricing_rule
    ON sms_messages (pricing_rule_id);

CREATE INDEX idx_sms_messages_destination_country
    ON sms_messages (destination_country, created_at DESC);
