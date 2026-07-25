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
    unit_cost_micros BIGINT NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_until TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    destination_country CHAR(2) NOT NULL,

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

-- sms_messages is created in migration 012. Attach its pricing-rule foreign key
-- after sms_pricing_rules exists.
ALTER TABLE sms_messages
    ADD CONSTRAINT fk_sms_messages_pricing_rule
        FOREIGN KEY (pricing_rule_id)
        REFERENCES sms_pricing_rules(id)
        ON DELETE RESTRICT;
