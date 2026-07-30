CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    name TEXT NOT NULL DEFAULT '',
    password_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    credential_version BIGINT NOT NULL DEFAULT 1,
    security_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_users_credential_version CHECK (credential_version > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique ON users (lower(email));

CREATE TABLE IF NOT EXISTS passkey_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id BYTEA NOT NULL UNIQUE,
    public_key BYTEA NOT NULL,
    sign_count BIGINT NOT NULL DEFAULT 0,
    transports TEXT[] NOT NULL DEFAULT '{}',
    backup_eligible BOOLEAN NOT NULL DEFAULT false,
    backup_state BOOLEAN NOT NULL DEFAULT false,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    CONSTRAINT chk_passkey_credential_present CHECK (octet_length(credential_id) > 0),
    CONSTRAINT chk_passkey_public_key_present CHECK (octet_length(public_key) > 0),
    CONSTRAINT chk_passkey_sign_count CHECK (sign_count >= 0),
    CONSTRAINT chk_passkey_name_present CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_passkey_credentials_user_active
    ON passkey_credentials (user_id, created_at)
    WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS totp_credentials (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    secret_ciphertext BYTEA NOT NULL,
    verified_at TIMESTAMPTZ,
    last_used_step BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_totp_secret_present CHECK (octet_length(secret_ciphertext) > 0)
);

CREATE TABLE IF NOT EXISTS recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL UNIQUE,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_recovery_code_hash_present CHECK (length(code_hash) > 0)
);

CREATE INDEX IF NOT EXISTS idx_recovery_codes_user_active
    ON recovery_codes (user_id)
    WHERE used_at IS NULL;

CREATE TABLE IF NOT EXISTS authentication_challenges (
    token_hash TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_authentication_challenge_purpose CHECK (
        purpose IN ('passkey_registration', 'passkey_authentication', 'mfa_login')
    ),
    CONSTRAINT chk_authentication_challenge_state CHECK (jsonb_typeof(state) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_authentication_challenges_expires
    ON authentication_challenges (expires_at)
    WHERE consumed_at IS NULL;
