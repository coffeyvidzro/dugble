CREATE OR REPLACE FUNCTION enforce_customer_email_tenant_route()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    tenant_name TEXT;
    configuration_set TEXT;
BEGIN
    IF NEW.sender_domain_id IS NULL THEN
        RAISE EXCEPTION 'customer email requires a verified sender domain'
            USING ERRCODE = '23514';
    END IF;

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

    SELECT external_name
    INTO tenant_name
    FROM email_tenants
    WHERE team_id = NEW.team_id
      AND provider = NEW.delivery_provider
      AND region = NEW.provider_region
      AND status = 'active';

    IF tenant_name IS NULL OR length(trim(tenant_name)) = 0 THEN
        RAISE EXCEPTION 'active customer email tenant is required'
            USING ERRCODE = '23514';
    END IF;

    configuration_set := CASE NEW.message_type
        WHEN 'marketing' THEN 'dugble-marketing'
        ELSE 'dugble-transactional'
    END;

    NEW.headers := jsonb_set(
        jsonb_set(
            jsonb_set(
                COALESCE(NEW.headers, '{}'::jsonb),
                '{X-Dugble-Internal-Email-Stream}',
                to_jsonb(NEW.message_type),
                true
            ),
            '{X-Dugble-Internal-SES-Configuration-Set}',
            to_jsonb(configuration_set),
            true
        ),
        '{X-Dugble-Internal-SES-Tenant}',
        to_jsonb(tenant_name),
        true
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_customer_email_tenant_route ON email_messages;

CREATE TRIGGER trg_enforce_customer_email_tenant_route
BEFORE INSERT ON email_messages
FOR EACH ROW
EXECUTE FUNCTION enforce_customer_email_tenant_route();
