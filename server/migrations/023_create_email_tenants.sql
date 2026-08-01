CREATE TABLE IF NOT EXISTS email_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    provider TEXT NOT NULL DEFAULT 'aws_ses',
    region TEXT NOT NULL,
    external_name TEXT NOT NULL,
    external_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    suppression_scope TEXT NOT NULL DEFAULT 'tenant',
    reputation_policy TEXT NOT NULL DEFAULT 'standard',
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_email_tenants_team_provider_region
        UNIQUE (team_id, provider, region),

    CONSTRAINT uq_email_tenants_provider_region_name
        UNIQUE (provider, region, external_name),

    CONSTRAINT chk_email_tenants_provider
        CHECK (length(trim(provider)) > 0 AND provider = lower(trim(provider))),

    CONSTRAINT chk_email_tenants_region
        CHECK (length(trim(region)) > 0 AND region = lower(trim(region))),

    CONSTRAINT chk_email_tenants_external_name
        CHECK (
            external_name = lower(trim(external_name))
            AND length(external_name) BETWEEN 1 AND 64
            AND external_name ~ '^[a-z0-9_-]+$'
        ),

    CONSTRAINT chk_email_tenants_external_id
        CHECK (external_id IS NULL OR length(trim(external_id)) > 0),

    CONSTRAINT chk_email_tenants_status
        CHECK (status IN (
            'pending',
            'provisioning',
            'active',
            'paused',
            'deleting',
            'failed'
        )),

    CONSTRAINT chk_email_tenants_suppression_scope
        CHECK (suppression_scope IN ('account', 'tenant')),

    CONSTRAINT chk_email_tenants_reputation_policy
        CHECK (reputation_policy IN ('none', 'standard', 'strict')),

    CONSTRAINT chk_email_tenants_failure_reason
        CHECK (failure_reason IS NULL OR length(trim(failure_reason)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_email_tenants_provider_region_external_id
    ON email_tenants (provider, region, external_id)
    WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_tenants_team_id
    ON email_tenants (team_id);

CREATE INDEX IF NOT EXISTS idx_email_tenants_lifecycle
    ON email_tenants (provider, region, status, updated_at);

CREATE OR REPLACE FUNCTION enforce_customer_email_tenant_route()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.sender_domain_id IS NULL THEN
        IF NEW.message_type <> 'transactional' THEN
            RAISE EXCEPTION 'onboarding identity supports transactional email only'
                USING ERRCODE = '23514';
        END IF;
    ELSE
        IF NOT EXISTS (
            SELECT 1
            FROM sender_domains AS domain
            WHERE domain.id = NEW.sender_domain_id
              AND domain.team_id = NEW.team_id
              AND domain.provider = NEW.delivery_provider
              AND domain.provider_region = NEW.provider_region
              AND domain.status = 'verified'
              AND domain.disabled_at IS NULL
              AND domain.health_status <> 'degraded'
        ) THEN
            RAISE EXCEPTION 'customer sender domain is not verified, enabled, and healthy'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    -- Routing names and header keys are application-owned constants. The
    -- database enforces only relational tenant isolation and lifecycle state.
    PERFORM 1
    FROM email_tenants
    WHERE team_id = NEW.team_id
      AND provider = NEW.delivery_provider
      AND region = NEW.provider_region
      AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'active customer email tenant is required'
            USING ERRCODE = '23514';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_customer_email_tenant_route ON email_messages;

CREATE TRIGGER trg_enforce_customer_email_tenant_route
BEFORE INSERT ON email_messages
FOR EACH ROW
EXECUTE FUNCTION enforce_customer_email_tenant_route();
