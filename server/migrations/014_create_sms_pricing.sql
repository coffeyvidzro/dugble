CREATE TABLE IF NOT EXISTS sms_pricing_plans (
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_sms_pricing_plans_default
    ON sms_pricing_plans (is_default)
    WHERE is_default = true AND status = 'active';

CREATE TABLE IF NOT EXISTS sms_pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricing_plan_id UUID NOT NULL REFERENCES sms_pricing_plans(id) ON DELETE RESTRICT,
    traffic_class TEXT NOT NULL,
    unit_cost_micros BIGINT NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_until TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_sms_pricing_rules_traffic_class CHECK (traffic_class IN ('local', 'a2p')),
    CONSTRAINT chk_sms_pricing_rules_unit_cost CHECK (unit_cost_micros > 0),
    CONSTRAINT chk_sms_pricing_rules_effective_range CHECK (
        effective_until IS NULL OR effective_until > effective_from
    ),
    CONSTRAINT chk_sms_pricing_rules_status CHECK (status IN ('active', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_sms_pricing_rules_lookup
    ON sms_pricing_rules (
        pricing_plan_id,
        traffic_class,
        status,
        effective_from DESC
    );

CREATE TABLE IF NOT EXISTS team_sms_settings (
    team_id UUID PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE,
    pricing_plan_id UUID NOT NULL REFERENCES sms_pricing_plans(id) ON DELETE RESTRICT,
    default_traffic_class TEXT NOT NULL DEFAULT 'a2p',
    local_enabled BOOLEAN NOT NULL DEFAULT false,
    a2p_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_team_sms_settings_default_class CHECK (
        default_traffic_class IN ('local', 'a2p')
    ),
    CONSTRAINT chk_team_sms_settings_default_enabled CHECK (
        (default_traffic_class = 'local' AND local_enabled)
        OR (default_traffic_class = 'a2p' AND a2p_enabled)
    )
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
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sms_pricing_rules (
    id,
    pricing_plan_id,
    traffic_class,
    unit_cost_micros,
    effective_from,
    status
) VALUES (
    '9f6cb7f6-1a21-4a79-9aa8-9782c867a101',
    '9f6cb7f6-1a21-4a79-9aa8-9782c867a001',
    'a2p',
    9000,
    '1970-01-01T00:00:00Z',
    'active'
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE sms_messages
    ADD COLUMN IF NOT EXISTS traffic_class TEXT NOT NULL DEFAULT 'a2p',
    ADD COLUMN IF NOT EXISTS pricing_rule_id UUID,
    ADD COLUMN IF NOT EXISTS unit_cost_micros BIGINT NOT NULL DEFAULT 0;

UPDATE sms_messages
SET pricing_rule_id = COALESCE(
        pricing_rule_id,
        '9f6cb7f6-1a21-4a79-9aa8-9782c867a101'::uuid
    ),
    unit_cost_micros = CASE
        WHEN unit_cost_micros > 0 THEN unit_cost_micros
        WHEN segments > 0 THEN cost_micros / segments
        ELSE 0
    END;

ALTER TABLE sms_messages
    ALTER COLUMN pricing_rule_id SET NOT NULL;

ALTER TABLE sms_messages
    ADD CONSTRAINT fk_sms_messages_pricing_rule
        FOREIGN KEY (pricing_rule_id)
        REFERENCES sms_pricing_rules(id)
        ON DELETE RESTRICT,
    ADD CONSTRAINT chk_sms_messages_traffic_class
        CHECK (traffic_class IN ('local', 'a2p')),
    ADD CONSTRAINT chk_sms_messages_unit_cost_non_negative
        CHECK (unit_cost_micros >= 0);

CREATE INDEX IF NOT EXISTS idx_sms_messages_pricing_rule
    ON sms_messages (pricing_rule_id);
