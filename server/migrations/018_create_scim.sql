CREATE TABLE IF NOT EXISTS scim_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_scim_token_name CHECK (length(trim(name)) > 0)
);
CREATE INDEX IF NOT EXISTS idx_scim_tokens_team_active
    ON scim_tokens (team_id, created_at)
    WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS scim_external_ids (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (team_id, user_id),
    UNIQUE (team_id, external_id),
    CONSTRAINT chk_scim_external_id CHECK (length(trim(external_id)) > 0)
);

ALTER TABLE audit_events DROP CONSTRAINT IF EXISTS chk_audit_events_actor_type;
ALTER TABLE audit_events
    ADD CONSTRAINT chk_audit_events_actor_type
    CHECK (actor_type IN ('user', 'team_token', 'workload', 'scim_token', 'system'));
