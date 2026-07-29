ALTER TABLE sms_messages
    DROP CONSTRAINT IF EXISTS fk_sms_messages_pricing_rule,
    DROP COLUMN IF EXISTS pricing_rule_id,
    DROP COLUMN IF EXISTS unit_cost_micros,
    DROP COLUMN IF EXISTS cost_micros;

DROP TABLE IF EXISTS sms_pricing_audit_log;
DROP TABLE IF EXISTS team_sms_settings;
DROP TABLE IF EXISTS sms_pricing_rules;
DROP TABLE IF EXISTS sms_pricing_plans;
DROP TABLE IF EXISTS wallet_transactions;
DROP TABLE IF EXISTS wallets;
