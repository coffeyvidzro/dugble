CREATE TABLE IF NOT EXISTS workload_oidc_federations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workload_id UUID NOT NULL REFERENCES workload_identities(id) ON DELETE CASCADE,
    name TEXT NOT NULL, issuer_url TEXT NOT NULL, audiences TEXT[] NOT NULL,
    subject TEXT NOT NULL, required_claims JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT true, created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(workload_id,name),
    CONSTRAINT chk_workload_oidc_name CHECK(length(trim(name))>0),
    CONSTRAINT chk_workload_oidc_issuer CHECK(issuer_url ~ '^https://'),
    CONSTRAINT chk_workload_oidc_audiences CHECK(cardinality(audiences)>0),
    CONSTRAINT chk_workload_oidc_subject CHECK(length(subject)>0),
    CONSTRAINT chk_workload_oidc_claims CHECK(jsonb_typeof(required_claims)='object')
);
CREATE INDEX IF NOT EXISTS idx_workload_oidc_federations_workload ON workload_oidc_federations(workload_id) WHERE enabled;
ALTER TABLE workload_access_tokens ADD COLUMN IF NOT EXISTS federation_id UUID REFERENCES workload_oidc_federations(id) ON DELETE CASCADE;
ALTER TABLE workload_access_tokens ALTER COLUMN credential_id DROP NOT NULL;
ALTER TABLE workload_access_tokens DROP CONSTRAINT IF EXISTS chk_workload_access_token_source;
ALTER TABLE workload_access_tokens ADD CONSTRAINT chk_workload_access_token_source CHECK(num_nonnulls(credential_id,federation_id)=1);
