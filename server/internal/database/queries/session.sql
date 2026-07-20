-- name: CreateSession :one
INSERT INTO sessions (
    user_id,
    token_hash,
    user_agent,
    ip_address,
    expires_at
) VALUES (
    sqlc.arg(user_id),
    sqlc.arg(token_hash),
    sqlc.narg(user_agent),
    sqlc.narg(ip_address),
    sqlc.arg(expires_at)
)
RETURNING *;

-- name: GetSessionByID :one
SELECT *
FROM sessions
WHERE id = sqlc.arg(id);

-- name: GetSessionByTokenHash :one
SELECT *
FROM sessions
WHERE token_hash = sqlc.arg(token_hash);

-- name: ListSessionsByUserID :many
SELECT *
FROM sessions
WHERE user_id = sqlc.arg(user_id)
ORDER BY last_seen_at DESC;

-- name: TouchSession :exec
UPDATE sessions
SET last_seen_at = now()
WHERE id = sqlc.arg(id);

-- name: RevokeSession :exec
UPDATE sessions
SET revoked_at = now()
WHERE id = sqlc.arg(id)
  AND user_id = sqlc.arg(user_id)
  AND revoked_at IS NULL;

-- name: RevokeUserSessions :exec
UPDATE sessions
SET revoked_at = now()
WHERE user_id = sqlc.arg(user_id)
  AND revoked_at IS NULL;

-- name: RevokeOtherUserSessions :exec
UPDATE sessions
SET revoked_at = now()
WHERE user_id = sqlc.arg(user_id)
  AND id <> sqlc.arg(current_session_id)
  AND revoked_at IS NULL;
