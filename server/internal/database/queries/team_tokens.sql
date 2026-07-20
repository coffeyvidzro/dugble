-- name: CreateTeamToken :one
INSERT INTO team_tokens (
    team_id,
    name,
    token_hash,
    token_prefix,
    permissions,
    created_by,
    expires_at
) VALUES (
    sqlc.arg(team_id),
    sqlc.arg(name),
    sqlc.arg(token_hash),
    sqlc.arg(token_prefix),
    sqlc.arg(permissions),
    sqlc.narg(created_by),
    sqlc.narg(expires_at)
)
RETURNING *;

-- name: GetActiveTeamTokenByHash :one
SELECT *
FROM team_tokens
WHERE token_hash = sqlc.arg(token_hash)
  AND revoked_at IS NULL
  AND (expires_at IS NULL OR expires_at > now());

-- name: ListTeamTokens :many
SELECT *
FROM team_tokens
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC;

-- name: UpdateTeamToken :one
UPDATE team_tokens
SET name = sqlc.arg(name),
    permissions = sqlc.arg(permissions),
    expires_at = sqlc.narg(expires_at),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND revoked_at IS NULL
RETURNING *;

-- name: RevokeTeamToken :one
UPDATE team_tokens
SET revoked_at = now(),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND revoked_at IS NULL
RETURNING *;

-- name: TouchTeamToken :exec
UPDATE team_tokens
SET last_used_at = now()
WHERE id = sqlc.arg(id);
