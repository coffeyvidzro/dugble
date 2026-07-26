-- name: CreateWebhookEndpoint :one
INSERT INTO webhook_endpoints (
    team_id,
    url,
    description,
    signing_secret_ciphertext,
    enabled,
    subscribed_events,
    api_version
) VALUES (
    sqlc.arg(team_id),
    sqlc.arg(url),
    sqlc.narg(description),
    sqlc.arg(signing_secret_ciphertext),
    true,
    sqlc.arg(subscribed_events),
    sqlc.arg(api_version)
)
RETURNING *;

-- name: ListWebhookEndpoints :many
SELECT *
FROM webhook_endpoints
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: GetWebhookEndpoint :one
SELECT *
FROM webhook_endpoints
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id);

-- name: UpdateWebhookEndpoint :one
UPDATE webhook_endpoints
SET url = sqlc.arg(url),
    description = sqlc.narg(description),
    enabled = sqlc.arg(enabled),
    subscribed_events = sqlc.arg(subscribed_events),
    api_version = sqlc.arg(api_version),
    disabled_at = CASE
        WHEN sqlc.arg(enabled)::boolean THEN NULL
        ELSE COALESCE(disabled_at, now())
    END,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
RETURNING *;

-- name: DisableWebhookEndpoint :one
UPDATE webhook_endpoints
SET enabled = false,
    disabled_at = COALESCE(disabled_at, now()),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
RETURNING *;

-- name: RotateWebhookEndpointSecret :one
UPDATE webhook_endpoints
SET signing_secret_ciphertext = sqlc.arg(signing_secret_ciphertext),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
RETURNING *;

-- name: ListSubscribedWebhookEndpoints :many
SELECT *
FROM webhook_endpoints
WHERE team_id = sqlc.arg(team_id)
  AND enabled = true
  AND disabled_at IS NULL
  AND sqlc.arg(event_type)::text = ANY(subscribed_events)
ORDER BY created_at, id;
