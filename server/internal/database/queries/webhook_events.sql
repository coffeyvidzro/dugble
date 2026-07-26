-- name: CreateWebhookEvent :one
INSERT INTO webhook_events (
    id,
    team_id,
    event_type,
    object_type,
    object_id,
    api_version,
    payload,
    occurred_at
) VALUES (
    sqlc.arg(id),
    sqlc.arg(team_id),
    sqlc.arg(event_type),
    sqlc.arg(object_type),
    sqlc.narg(object_id),
    sqlc.arg(api_version),
    sqlc.arg(payload),
    sqlc.arg(occurred_at)
)
ON CONFLICT (id) DO UPDATE
SET id = EXCLUDED.id
RETURNING *;

-- name: GetWebhookEvent :one
SELECT *
FROM webhook_events
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id);

-- name: ListWebhookEvents :many
SELECT *
FROM webhook_events
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: ListWebhookEventsForObject :many
SELECT *
FROM webhook_events
WHERE team_id = sqlc.arg(team_id)
  AND object_type = sqlc.arg(object_type)
  AND object_id IS NOT DISTINCT FROM sqlc.narg(object_id)
ORDER BY occurred_at DESC, created_at DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);
