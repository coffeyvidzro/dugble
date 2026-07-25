-- Transition pricing from Local/A2P classes to destination-country rates.
-- Existing A2P timelines become Ghana timelines. Existing Local timelines are
-- archived but retained so historical message pricing references remain valid.

ALTER TABLE sms_pricing_rules
    ADD COLUMN IF NOT EXISTS destination_country CHAR(2);

UPDATE sms_pricing_rules
SET destination_country = 'GH'
WHERE destination_country IS NULL;

UPDATE sms_pricing_rules
SET status = 'archived',
    updated_at = now()
WHERE traffic_class = 'local'
  AND status = 'active';

DROP INDEX IF EXISTS idx_sms_pricing_rules_lookup;

ALTER TABLE sms_pricing_rules
    ALTER COLUMN destination_country SET NOT NULL,
    DROP CONSTRAINT IF EXISTS chk_sms_pricing_rules_traffic_class,
    DROP COLUMN IF EXISTS traffic_class;

ALTER TABLE sms_pricing_rules
    ADD CONSTRAINT chk_sms_pricing_rules_destination_country
        CHECK (destination_country ~ '^[A-Z]{2}$');

CREATE INDEX IF NOT EXISTS idx_sms_pricing_rules_lookup
    ON sms_pricing_rules (
        pricing_plan_id,
        destination_country,
        status,
        effective_from DESC
    );

ALTER TABLE team_sms_settings
    DROP CONSTRAINT IF EXISTS chk_team_sms_settings_default_enabled,
    DROP CONSTRAINT IF EXISTS chk_team_sms_settings_default_class,
    DROP COLUMN IF EXISTS default_traffic_class,
    DROP COLUMN IF EXISTS local_enabled,
    DROP COLUMN IF EXISTS a2p_enabled;

ALTER TABLE sms_messages
    ADD COLUMN IF NOT EXISTS destination_country CHAR(2);

UPDATE sms_messages
SET destination_country = CASE
    WHEN to_number LIKE '+233%' THEN 'GH'
    WHEN to_number LIKE '+234%' THEN 'NG'
    ELSE 'ZZ'
END
WHERE destination_country IS NULL;

ALTER TABLE sms_messages
    ALTER COLUMN destination_country SET NOT NULL,
    DROP CONSTRAINT IF EXISTS chk_sms_messages_traffic_class,
    DROP COLUMN IF EXISTS traffic_class;

ALTER TABLE sms_messages
    ADD CONSTRAINT chk_sms_messages_destination_country
        CHECK (destination_country ~ '^[A-Z]{2}$');

CREATE INDEX IF NOT EXISTS idx_sms_messages_destination_country
    ON sms_messages (destination_country, created_at DESC);
