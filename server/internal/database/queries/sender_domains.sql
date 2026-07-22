-- name: CreateSenderDomain :one
INSERT INTO sender_domains (
    team_id,
    domain,
    provider,
    provider_region,
    verification_records,
    created_by
) VALUES (
    sqlc.arg(team_id),
    sqlc.arg(domain),
    sqlc.arg(provider),
    sqlc.arg(provider_region),
    sqlc.arg(verification_records),
    sqlc.narg(created_by)
)
RETURNING *;

-- name: ListSenderDomains :many
SELECT *
FROM sender_domains
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC;

-- name: GetSenderDomain :one
SELECT *
FROM sender_domains
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id);

-- name: DeleteSenderDomain :one
DELETE FROM sender_domains
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
RETURNING *;

-- name: UpdateSenderDomainVerification :one
UPDATE sender_domains
SET status = sqlc.arg(status),
    verification_records = sqlc.arg(verification_records),
    failure_reason = sqlc.narg(failure_reason),
    last_checked_at = now(),
    verified_at = CASE WHEN sqlc.arg(status) = 'verified' THEN now() ELSE verified_at END,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
RETURNING *;

-- name: GetSenderDomainByDomain :one
SELECT *
FROM sender_domains
WHERE team_id = sqlc.arg(team_id)
  AND domain = sqlc.arg(domain);
