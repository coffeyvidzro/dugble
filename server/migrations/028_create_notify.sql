CREATE TABLE IF NOT EXISTS notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    locale TEXT,
    timezone TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_notification_recipients_team_external
        UNIQUE (team_id, external_id),
    CONSTRAINT uq_notification_recipients_id_team UNIQUE (id, team_id),
    CONSTRAINT chk_notification_recipients_external_id CHECK (
        length(trim(external_id)) > 0
    ),
    CONSTRAINT chk_notification_recipients_contact CHECK (
        email IS NOT NULL OR phone IS NOT NULL
    ),
    CONSTRAINT chk_notification_recipients_email CHECK (
        email IS NULL OR (length(trim(email)) > 0 AND email = lower(email))
    ),
    CONSTRAINT chk_notification_recipients_phone CHECK (
        phone IS NULL OR length(trim(phone)) > 0
    ),
    CONSTRAINT chk_notification_recipients_data CHECK (
        jsonb_typeof(data) = 'object'
    )
);

CREATE INDEX IF NOT EXISTS idx_notification_recipients_team_created
    ON notification_recipients (team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_recipients_team_email
    ON notification_recipients (team_id, email)
    WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_recipients_team_phone
    ON notification_recipients (team_id, phone)
    WHERE phone IS NOT NULL;

CREATE TABLE IF NOT EXISTS notification_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    enabled BOOLEAN NOT NULL DEFAULT true,
    published_version_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_notification_workflows_team_key UNIQUE (team_id, key),
    CONSTRAINT uq_notification_workflows_id_team UNIQUE (id, team_id),
    CONSTRAINT chk_notification_workflows_key CHECK (
        length(trim(key)) > 0 AND key !~ '[[:space:]]'
    ),
    CONSTRAINT chk_notification_workflows_name CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_notification_workflows_category CHECK (
        length(trim(category)) > 0 AND category !~ '[[:space:]]'
    )
);

CREATE INDEX IF NOT EXISTS idx_notification_workflows_team_created
    ON notification_workflows (team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_workflows_team_enabled
    ON notification_workflows (team_id, key)
    WHERE enabled;

CREATE TABLE IF NOT EXISTS notification_workflow_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL,
    version INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    definition JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,

    CONSTRAINT uq_notification_workflow_versions_number
        UNIQUE (workflow_id, version),
    CONSTRAINT uq_notification_workflow_versions_identity
        UNIQUE (id, workflow_id, team_id),
    CONSTRAINT fk_notification_workflow_versions_workflow_same_team
        FOREIGN KEY (workflow_id, team_id)
        REFERENCES notification_workflows (id, team_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_notification_workflow_versions_version CHECK (version > 0),
    CONSTRAINT chk_notification_workflow_versions_status CHECK (
        status IN ('draft', 'published', 'retired')
    ),
    CONSTRAINT chk_notification_workflow_versions_definition CHECK (
        jsonb_typeof(definition) = 'object'
    ),
    CONSTRAINT chk_notification_workflow_versions_published CHECK (
        (status = 'draft' AND published_at IS NULL)
        OR (status IN ('published', 'retired') AND published_at IS NOT NULL)
    )
);

ALTER TABLE notification_workflows
    ADD CONSTRAINT fk_notification_workflows_published_version
    FOREIGN KEY (published_version_id, id, team_id)
    REFERENCES notification_workflow_versions (id, workflow_id, team_id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notification_workflow_versions_workflow_created
    ON notification_workflow_versions (workflow_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_workflow_versions_published
    ON notification_workflow_versions (workflow_id)
    WHERE status = 'published';

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    workflow_id UUID,
    channel TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_notification_preferences_recipient_same_team
        FOREIGN KEY (recipient_id, team_id)
        REFERENCES notification_recipients (id, team_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notification_preferences_workflow_same_team
        FOREIGN KEY (workflow_id, team_id)
        REFERENCES notification_workflows (id, team_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_notification_preferences_category CHECK (
        length(trim(category)) > 0 AND category !~ '[[:space:]]'
    ),
    CONSTRAINT chk_notification_preferences_channel CHECK (
        channel IN ('email', 'sms', 'inbox')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_preferences_category
    ON notification_preferences (team_id, recipient_id, category, channel)
    WHERE workflow_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_preferences_workflow
    ON notification_preferences (team_id, recipient_id, workflow_id, channel)
    WHERE workflow_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_preferences_recipient
    ON notification_preferences (team_id, recipient_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS notification_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL,
    workflow_version_id UUID NOT NULL,
    recipient_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    trigger_key TEXT,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_notification_runs_id_team UNIQUE (id, team_id),
    CONSTRAINT fk_notification_runs_workflow_same_team
        FOREIGN KEY (workflow_id, team_id)
        REFERENCES notification_workflows (id, team_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_notification_runs_version
        FOREIGN KEY (workflow_version_id, workflow_id, team_id)
        REFERENCES notification_workflow_versions (id, workflow_id, team_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_notification_runs_recipient_same_team
        FOREIGN KEY (recipient_id, team_id)
        REFERENCES notification_recipients (id, team_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_notification_runs_status CHECK (status IN (
        'queued', 'running', 'waiting', 'completed', 'failed', 'canceled'
    )),
    CONSTRAINT chk_notification_runs_trigger_key CHECK (
        trigger_key IS NULL OR length(trim(trigger_key)) > 0
    ),
    CONSTRAINT chk_notification_runs_data CHECK (jsonb_typeof(data) = 'object'),
    CONSTRAINT chk_notification_runs_terminal_timestamps CHECK (
        (status <> 'completed' OR completed_at IS NOT NULL)
        AND (status <> 'failed' OR failed_at IS NOT NULL)
        AND (status <> 'canceled' OR canceled_at IS NOT NULL)
        AND (completed_at IS NULL OR status = 'completed')
        AND (failed_at IS NULL OR status = 'failed')
        AND (canceled_at IS NULL OR status = 'canceled')
    )
);

CREATE INDEX IF NOT EXISTS idx_notification_runs_team_created
    ON notification_runs (team_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_runs_recipient_created
    ON notification_runs (team_id, recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_runs_scheduled
    ON notification_runs (scheduled_at, created_at)
    WHERE status IN ('queued', 'waiting');

CREATE TABLE IF NOT EXISTS notification_step_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    run_id UUID NOT NULL,
    step_key TEXT NOT NULL,
    step_type TEXT NOT NULL,
    channel TEXT,
    sequence INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    attempt_count INTEGER NOT NULL DEFAULT 0,
    available_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    email_message_id UUID,
    sms_message_id UUID,
    inbox_message_id UUID,
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    output JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_notification_step_runs_key UNIQUE (run_id, step_key),
    CONSTRAINT fk_notification_step_runs_run_same_team
        FOREIGN KEY (run_id, team_id)
        REFERENCES notification_runs (id, team_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notification_step_runs_email_same_team
        FOREIGN KEY (email_message_id, team_id)
        REFERENCES email_messages (id, team_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_notification_step_runs_sms_same_team
        FOREIGN KEY (sms_message_id, team_id)
        REFERENCES sms_messages (id, team_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_notification_step_runs_inbox_same_team
        FOREIGN KEY (inbox_message_id, team_id)
        REFERENCES inbox_messages (id, team_id)
        ON DELETE SET NULL,
    CONSTRAINT chk_notification_step_runs_key CHECK (
        length(trim(step_key)) > 0
    ),
    CONSTRAINT chk_notification_step_runs_type CHECK (
        step_type IN ('email', 'sms', 'inbox', 'delay', 'condition')
    ),
    CONSTRAINT chk_notification_step_runs_channel CHECK (
        channel IS NULL OR channel IN ('email', 'sms', 'inbox')
    ),
    CONSTRAINT chk_notification_step_runs_sequence CHECK (sequence > 0),
    CONSTRAINT chk_notification_step_runs_status CHECK (status IN (
        'pending', 'running', 'waiting', 'completed', 'skipped', 'failed', 'canceled'
    )),
    CONSTRAINT chk_notification_step_runs_attempt_count CHECK (attempt_count >= 0),
    CONSTRAINT chk_notification_step_runs_message_reference CHECK (
        num_nonnulls(email_message_id, sms_message_id, inbox_message_id) <= 1
    ),
    CONSTRAINT chk_notification_step_runs_input CHECK (jsonb_typeof(input) = 'object'),
    CONSTRAINT chk_notification_step_runs_output CHECK (jsonb_typeof(output) = 'object'),
    CONSTRAINT chk_notification_step_runs_terminal_timestamps CHECK (
        (status <> 'completed' OR completed_at IS NOT NULL)
        AND (status <> 'failed' OR failed_at IS NOT NULL)
        AND (completed_at IS NULL OR status = 'completed')
        AND (failed_at IS NULL OR status = 'failed')
    )
);

CREATE INDEX IF NOT EXISTS idx_notification_step_runs_run_sequence
    ON notification_step_runs (run_id, sequence);

CREATE INDEX IF NOT EXISTS idx_notification_step_runs_available
    ON notification_step_runs (available_at, created_at)
    WHERE status IN ('pending', 'waiting');

CREATE INDEX IF NOT EXISTS idx_notification_step_runs_email_message
    ON notification_step_runs (email_message_id)
    WHERE email_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_step_runs_sms_message
    ON notification_step_runs (sms_message_id)
    WHERE sms_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_step_runs_inbox_message
    ON notification_step_runs (inbox_message_id)
    WHERE inbox_message_id IS NOT NULL;
