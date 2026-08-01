CREATE TABLE IF NOT EXISTS team_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    token_prefix TEXT NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_team_tokens_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_team_tokens_team_id
    ON team_tokens (team_id);

CREATE INDEX IF NOT EXISTS idx_team_tokens_team_id_revoked_at
    ON team_tokens (team_id, revoked_at);

CREATE INDEX IF NOT EXISTS idx_team_tokens_token_hash
    ON team_tokens (token_hash);

CREATE INDEX IF NOT EXISTS idx_team_tokens_expires_at
    ON team_tokens (expires_at);

CREATE TABLE IF NOT EXISTS workload_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    disabled_at TIMESTAMPTZ,
    UNIQUE (team_id, name),
    CONSTRAINT chk_workload_identities_name CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_workload_identities_status CHECK (status IN ('active', 'disabled')),
    CONSTRAINT chk_workload_identities_permissions CHECK (cardinality(permissions) > 0)
);

CREATE INDEX IF NOT EXISTS idx_workload_identities_team ON workload_identities (team_id, status);

CREATE TABLE IF NOT EXISTS workload_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workload_id UUID NOT NULL REFERENCES workload_identities(id) ON DELETE CASCADE,
    secret_hash TEXT NOT NULL UNIQUE,
    secret_prefix TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_workload_credentials_prefix CHECK (length(secret_prefix) > 0)
);

CREATE INDEX IF NOT EXISTS idx_workload_credentials_workload ON workload_credentials (workload_id, revoked_at);

CREATE TABLE IF NOT EXISTS workload_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workload_id UUID NOT NULL REFERENCES workload_identities(id) ON DELETE CASCADE,
    credential_id UUID NOT NULL REFERENCES workload_credentials(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workload_access_tokens_workload ON workload_access_tokens (workload_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_workload_access_tokens_expires ON workload_access_tokens (expires_at) WHERE revoked_at IS NULL;
