ALTER TABLE users
    ADD COLUMN credential_version BIGINT NOT NULL DEFAULT 1,
    ADD COLUMN security_updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE sessions
    ADD COLUMN credential_version BIGINT NOT NULL DEFAULT 1,
    ADD COLUMN authentication_method TEXT NOT NULL DEFAULT 'password',
    ADD COLUMN assurance_level TEXT NOT NULL DEFAULT 'aal1',
    ADD COLUMN authenticated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN mfa_completed_at TIMESTAMPTZ;

ALTER TABLE users
    ADD CONSTRAINT chk_users_credential_version CHECK (credential_version > 0);

ALTER TABLE sessions
    ADD CONSTRAINT chk_sessions_credential_version CHECK (credential_version > 0),
    ADD CONSTRAINT chk_sessions_authentication_method CHECK (
        authentication_method IN ('password', 'passkey', 'oidc', 'recovery_code')
    ),
    ADD CONSTRAINT chk_sessions_assurance_level CHECK (
        assurance_level IN ('aal1', 'aal2', 'aal3')
    ),
    ADD CONSTRAINT chk_sessions_mfa_assurance CHECK (
        mfa_completed_at IS NULL OR assurance_level IN ('aal2', 'aal3')
    );

CREATE INDEX IF NOT EXISTS idx_sessions_user_credential_version
    ON sessions (user_id, credential_version)
    WHERE revoked_at IS NULL;
