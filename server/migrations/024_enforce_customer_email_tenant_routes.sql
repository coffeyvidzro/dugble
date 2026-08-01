CREATE OR REPLACE FUNCTION enforce_customer_email_tenant_route()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    tenant_name TEXT;
    expected_configuration_set TEXT;
    persisted_stream TEXT;
    persisted_configuration_set TEXT;
    persisted_tenant TEXT;
BEGIN
    IF lower(NEW.from_email) = 'onboarding@dugble.me' THEN
        IF NEW.message_type <> 'transactional' THEN
            RAISE EXCEPTION 'onboarding identity supports transactional email only'
                USING ERRCODE = '23514';
        END IF;
        IF NEW.sender_domain_id IS NOT NULL THEN
            RAISE EXCEPTION 'onboarding identity must not reference a sender domain'
                USING ERRCODE = '23514';
        END IF;
    ELSE
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

    expected_configuration_set := CASE NEW.message_type
        WHEN 'marketing' THEN 'dugble-marketing'
        ELSE 'dugble-transactional'
    END;
    persisted_stream := trim(COALESCE(NEW.headers ->> 'X-Dugble-Internal-Email-Stream', ''));
    persisted_configuration_set := trim(COALESCE(NEW.headers ->> 'X-Dugble-Internal-SES-Configuration-Set', ''));
    persisted_tenant := trim(COALESCE(NEW.headers ->> 'X-Dugble-Internal-SES-Tenant', ''));

    IF persisted_stream <> NEW.message_type THEN
        RAISE EXCEPTION 'persisted customer email stream does not match message stream'
            USING ERRCODE = '23514';
    END IF;
    IF persisted_configuration_set <> expected_configuration_set THEN
        RAISE EXCEPTION 'persisted customer configuration set is invalid'
            USING ERRCODE = '23514';
    END IF;
    IF lower(persisted_tenant) = 'dugble-system' THEN
        RAISE EXCEPTION 'customer email cannot use the system SES tenant'
            USING ERRCODE = '23514';
    END IF;
    IF persisted_tenant <> tenant_name THEN
        RAISE EXCEPTION 'persisted customer SES tenant does not belong to the message team'
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
