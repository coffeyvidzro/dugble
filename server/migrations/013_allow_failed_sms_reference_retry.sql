DROP INDEX IF EXISTS uq_sms_messages_team_client_reference;

CREATE UNIQUE INDEX IF NOT EXISTS uq_sms_messages_team_client_reference
    ON sms_messages (team_id, client_reference)
    WHERE client_reference IS NOT NULL AND status <> 'failed';
