-- name: CreateEmailTenant :one
INSERT INTO email_tenants (
    team_id,
    provider,
    region,
    external_name,
    suppression_scope,
    reputation_policy
)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (team_id, provider, region)
DO UPDATE SET updated_at = email_tenants.updated_at
RETURNING *;

-- name: GetEmailTenant :one
SELECT *
FROM email_tenants
WHERE id = $1;

-- name: GetEmailTenantByTeamProviderRegion :one
SELECT *
FROM email_tenants
WHERE team_id = $1
  AND provider = $2
  AND region = $3;

-- name: MarkEmailTenantProvisioning :one
UPDATE email_tenants
SET status = 'provisioning',
    failure_reason = NULL,
    updated_at = now()
WHERE id = $1
  AND status IN ('pending', 'failed')
RETURNING *;

-- name: MarkEmailTenantActive :one
UPDATE email_tenants
SET external_id = $2,
    status = 'active',
    failure_reason = NULL,
    updated_at = now()
WHERE id = $1
  AND status = 'provisioning'
RETURNING *;

-- name: MarkEmailTenantFailed :one
UPDATE email_tenants
SET status = 'failed',
    failure_reason = $2,
    updated_at = now()
WHERE id = $1
  AND status IN ('pending', 'provisioning')
RETURNING *;

-- name: MarkEmailTenantPaused :one
UPDATE email_tenants
SET status = 'paused',
    failure_reason = $2,
    updated_at = now()
WHERE id = $1
  AND status = 'active'
RETURNING *;

-- name: MarkEmailTenantDeleting :one
UPDATE email_tenants
SET status = 'deleting',
    updated_at = now()
WHERE id = $1
  AND status IN ('active', 'paused', 'failed')
RETURNING *;

-- name: DeleteEmailTenant :execrows
DELETE FROM email_tenants
WHERE id = $1
  AND status = 'deleting';
