ALTER TABLE sms_messages
    DROP CONSTRAINT IF EXISTS chk_sms_messages_status;

ALTER TABLE sms_messages
    ADD CONSTRAINT chk_sms_messages_status
        CHECK (status IN ('queued', 'processing', 'submitted', 'sent', 'delivered', 'undelivered', 'rejected', 'failed', 'expired', 'unknown'));
