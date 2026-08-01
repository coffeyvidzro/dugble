CREATE TABLE IF NOT EXISTS oidc_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer_url TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_secret_ciphertext BYTEA NOT NULL,
    allowed_domains TEXT[] NOT NULL DEFAULT '{}',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (team_id),
    CONSTRAINT chk_oidc_connection_name CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_oidc_connection_issuer CHECK (issuer_url ~ '^https://'),
    CONSTRAINT chk_oidc_connection_client CHECK (length(trim(client_id)) > 0),
    CONSTRAINT chk_oidc_connection_secret CHECK (octet_length(client_secret_ciphertext) > 0)
);
CREATE INDEX IF NOT EXISTS idx_oidc_connections_enabled ON oidc_connections (team_id) WHERE enabled;

CREATE TABLE IF NOT EXISTS oidc_login_states (
    state_hash TEXT PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES oidc_connections(id) ON DELETE CASCADE,
    code_verifier_ciphertext BYTEA NOT NULL,
    nonce TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_oidc_login_states_expiry ON oidc_login_states (expires_at) WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS external_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES oidc_connections(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (connection_id, subject),
    UNIQUE (user_id, connection_id),
    CONSTRAINT chk_external_identity_subject CHECK (length(subject) > 0)
);
