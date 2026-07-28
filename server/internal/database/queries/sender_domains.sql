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

-- name: ClaimSenderDomainsForReconciliation :many
WITH candidates AS (
    SELECT id
    FROM sender_domains
    WHERE sender_domains.status = 'pending'
      AND sender_domains.disabled_at IS NULL
      AND sender_domains.next_check_at <= now()
      AND (sender_domains.reconcile_locked_at IS NULL OR sender_domains.reconcile_locked_at < sqlc.arg(stale_before))
    ORDER BY sender_domains.next_check_at, sender_domains.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT sqlc.arg(batch_size)
)
UPDATE sender_domains AS domain
SET reconcile_locked_at = now(),
    reconcile_locked_by = sqlc.arg(worker_id),
    verification_attempts = domain.verification_attempts + 1,
    updated_at = now()
FROM candidates
WHERE domain.id = candidates.id
RETURNING domain.*;

-- name: CompleteSenderDomainReconciliation :one
UPDATE sender_domains
SET status = sqlc.arg(status),
    verification_records = sqlc.arg(verification_records),
    failure_reason = NULL,
    last_checked_at = now(),
    next_check_at = sqlc.arg(next_check_at),
    verified_at = CASE WHEN sqlc.arg(status) = 'verified' THEN COALESCE(verified_at, now()) ELSE verified_at END,
    reconcile_locked_at = NULL,
    reconcile_locked_by = NULL,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND reconcile_locked_by = sqlc.arg(worker_id)
RETURNING *;

-- name: RecordSenderDomainReconciliationFailure :one
UPDATE sender_domains
SET failure_reason = sqlc.arg(failure_reason),
    last_checked_at = now(),
    next_check_at = sqlc.arg(next_check_at),
    reconcile_locked_at = NULL,
    reconcile_locked_by = NULL,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND reconcile_locked_by = sqlc.arg(worker_id)
RETURNING *;
