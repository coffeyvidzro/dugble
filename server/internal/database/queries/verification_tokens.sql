-- name: CreateVerificationToken :one
INSERT INTO verification_tokens (
    identifier,
    token_hash,
    expires_at
) VALUES (
    sqlc.arg(identifier),
    sqlc.arg(token_hash),
    sqlc.arg(expires_at)
)
RETURNING *;

-- name: GetVerificationToken :one
SELECT *
FROM verification_tokens
WHERE identifier = sqlc.arg(identifier)
  AND token_hash = sqlc.arg(token_hash)
  AND expires_at > now();

-- name: DeleteVerificationToken :exec
DELETE FROM verification_tokens
WHERE identifier = sqlc.arg(identifier)
  AND token_hash = sqlc.arg(token_hash);

-- name: DeleteVerificationTokensByIdentifier :exec
DELETE FROM verification_tokens
WHERE identifier = sqlc.arg(identifier);

-- name: DeleteExpiredVerificationTokens :exec
DELETE FROM verification_tokens
WHERE expires_at <= now();
