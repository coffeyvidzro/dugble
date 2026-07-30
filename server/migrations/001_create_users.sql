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
