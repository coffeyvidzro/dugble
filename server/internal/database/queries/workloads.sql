-- name: CreateWorkloadIdentity :one
INSERT INTO workload_identities (team_id, name, description, permissions, created_by)
VALUES (sqlc.arg(team_id), sqlc.arg(name), sqlc.arg(description), sqlc.arg(permissions), sqlc.arg(created_by))
RETURNING *;

-- name: ListWorkloadIdentities :many
SELECT * FROM workload_identities
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC;

-- name: GetWorkloadIdentity :one
SELECT * FROM workload_identities
WHERE id = sqlc.arg(id) AND team_id = sqlc.arg(team_id);

-- name: UpdateWorkloadIdentity :one
UPDATE workload_identities
SET name = sqlc.arg(name), description = sqlc.arg(description), permissions = sqlc.arg(permissions), updated_at = now()
WHERE id = sqlc.arg(id) AND team_id = sqlc.arg(team_id) AND status = 'active'
RETURNING *;

-- name: DisableWorkloadIdentity :one
UPDATE workload_identities
SET status = 'disabled', disabled_at = now(), updated_at = now()
WHERE id = sqlc.arg(id) AND team_id = sqlc.arg(team_id) AND status = 'active'
RETURNING *;

-- name: CreateWorkloadCredential :one
INSERT INTO workload_credentials (workload_id, secret_hash, secret_prefix, expires_at)
SELECT wi.id, sqlc.arg(secret_hash), sqlc.arg(secret_prefix), sqlc.arg(expires_at)
FROM workload_identities wi
WHERE wi.id = sqlc.arg(workload_id) AND wi.team_id = sqlc.arg(team_id) AND wi.status = 'active'
RETURNING *;

-- name: RevokeWorkloadCredential :one
UPDATE workload_credentials wc
SET revoked_at = now()
FROM workload_identities wi
WHERE wc.id = sqlc.arg(id) AND wc.workload_id = sqlc.arg(workload_id)
  AND wc.workload_id = wi.id AND wi.team_id = sqlc.arg(team_id) AND wc.revoked_at IS NULL
RETURNING wc.*;

-- name: GetActiveWorkloadCredentialByHash :one
SELECT wc.id AS credential_id, wi.id AS workload_id, wi.team_id, wi.name, wi.permissions
FROM workload_credentials wc
JOIN workload_identities wi ON wi.id = wc.workload_id
JOIN teams t ON t.id = wi.team_id
WHERE wc.secret_hash = sqlc.arg(secret_hash)
  AND wc.revoked_at IS NULL AND wc.expires_at > now()
  AND wi.status = 'active' AND t.status = 'active';

-- name: TouchWorkloadCredential :exec
UPDATE workload_credentials SET last_used_at = now()
WHERE id = sqlc.arg(id) AND (last_used_at IS NULL OR last_used_at < now() - interval '5 minutes');

-- name: CreateWorkloadAccessToken :one
INSERT INTO workload_access_tokens (workload_id, credential_id, token_hash, expires_at)
VALUES (sqlc.arg(workload_id), sqlc.arg(credential_id), sqlc.arg(token_hash), sqlc.arg(expires_at))
RETURNING *;

-- name: GetActiveWorkloadAccessTokenByHash :one
SELECT wat.id AS token_id, wat.credential_id, wi.id AS workload_id, wi.team_id, wi.name, wi.permissions, wat.expires_at
FROM workload_access_tokens wat
JOIN workload_identities wi ON wi.id = wat.workload_id
JOIN workload_credentials wc ON wc.id = wat.credential_id
JOIN teams t ON t.id = wi.team_id
WHERE wat.token_hash = sqlc.arg(token_hash)
  AND wat.revoked_at IS NULL AND wat.expires_at > now()
  AND wc.revoked_at IS NULL AND wc.expires_at > now()
  AND wi.status = 'active' AND t.status = 'active';

-- name: TouchWorkloadAccessToken :exec
UPDATE workload_access_tokens SET last_used_at = now()
WHERE id = sqlc.arg(id) AND (last_used_at IS NULL OR last_used_at < now() - interval '5 minutes');
