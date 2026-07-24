CREATE TABLE IF NOT EXISTS sms_pricing_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_sms_pricing_audit_action CHECK (length(trim(action)) > 0),
    CONSTRAINT chk_sms_pricing_audit_resource_type CHECK (resource_type IN ('plan', 'rate', 'team_settings'))
);

CREATE INDEX IF NOT EXISTS idx_sms_pricing_audit_resource
    ON sms_pricing_audit_log (resource_type, resource_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sms_pricing_audit_actor
    ON sms_pricing_audit_log (actor_user_id, created_at DESC);
