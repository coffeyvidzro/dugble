CREATE UNIQUE INDEX IF NOT EXISTS idx_email_messages_id_team
    ON email_messages (id, team_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_messages_id_team
    ON sms_messages (id, team_id);
