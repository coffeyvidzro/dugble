-- name: CreateWebhookDelivery :one
INSERT INTO webhook_deliveries (
    event_id,
    endpoint_id,
    status,
    next_attempt_at
) VALUES (
    sqlc.arg(event_id),
    sqlc.arg(endpoint_id),
    'pending',
    sqlc.arg(next_attempt_at)
)
ON CONFLICT (event_id, endpoint_id) DO UPDATE
SET event_id = EXCLUDED.event_id
RETURNING *;

-- name: CreateWebhookDeliveriesForEvent :execrows
INSERT INTO webhook_deliveries (event_id, endpoint_id, status, next_attempt_at)
SELECT
    sqlc.arg(event_id),
    endpoint.id,
    'pending',
    sqlc.arg(next_attempt_at)
FROM webhook_endpoints AS endpoint
JOIN webhook_events AS event
  ON event.id = sqlc.arg(event_id)
 AND event.team_id = endpoint.team_id
WHERE endpoint.enabled = true
  AND endpoint.disabled_at IS NULL
  AND event.event_type = ANY(endpoint.subscribed_events)
ON CONFLICT (event_id, endpoint_id) DO NOTHING;

-- name: GetWebhookDelivery :one
SELECT delivery.*
FROM webhook_deliveries AS delivery
JOIN webhook_events AS event ON event.id = delivery.event_id
WHERE delivery.id = sqlc.arg(id)
  AND event.team_id = sqlc.arg(team_id);

-- name: ListWebhookDeliveriesForEvent :many
SELECT delivery.*
FROM webhook_deliveries AS delivery
JOIN webhook_events AS event ON event.id = delivery.event_id
WHERE delivery.event_id = sqlc.arg(event_id)
  AND event.team_id = sqlc.arg(team_id)
ORDER BY delivery.created_at DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: ClaimWebhookDeliveries :many
WITH candidates AS (
    SELECT delivery.id
    FROM webhook_deliveries AS delivery
    JOIN webhook_endpoints AS endpoint ON endpoint.id = delivery.endpoint_id
    WHERE delivery.status IN ('pending', 'retrying')
      AND delivery.next_attempt_at <= now()
      AND endpoint.enabled = true
      AND endpoint.disabled_at IS NULL
      AND (
          delivery.locked_at IS NULL
          OR delivery.locked_at < sqlc.arg(stale_before)
      )
    ORDER BY delivery.next_attempt_at, delivery.created_at
    FOR UPDATE OF delivery SKIP LOCKED
    LIMIT sqlc.arg(limit_count)
)
UPDATE webhook_deliveries AS delivery
SET locked_at = now(),
    locked_by = sqlc.arg(worker_id),
    attempt_count = delivery.attempt_count + 1,
    last_attempt_at = now(),
    updated_at = now()
FROM candidates,
     webhook_events AS event,
     webhook_endpoints AS endpoint
WHERE delivery.id = candidates.id
  AND event.id = delivery.event_id
  AND endpoint.id = delivery.endpoint_id
RETURNING
    delivery.id,
    delivery.event_id,
    delivery.endpoint_id,
    delivery.attempt_count,
    event.team_id,
    event.event_type,
    event.api_version,
    event.payload,
    event.occurred_at,
    endpoint.url,
    endpoint.signing_secret;

-- name: MarkWebhookDeliverySucceeded :one
UPDATE webhook_deliveries
SET status = 'succeeded',
    response_status = sqlc.arg(response_status),
    response_body = sqlc.narg(response_body),
    last_error = NULL,
    delivered_at = now(),
    locked_at = NULL,
    locked_by = NULL,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND locked_by = sqlc.arg(worker_id)
RETURNING *;

-- name: ScheduleWebhookDeliveryRetry :one
UPDATE webhook_deliveries
SET status = 'retrying',
    next_attempt_at = sqlc.arg(next_attempt_at),
    response_status = sqlc.narg(response_status),
    response_body = sqlc.narg(response_body),
    last_error = sqlc.arg(last_error),
    locked_at = NULL,
    locked_by = NULL,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND locked_by = sqlc.arg(worker_id)
RETURNING *;

-- name: MarkWebhookDeliveryFailed :one
UPDATE webhook_deliveries
SET status = 'failed',
    response_status = sqlc.narg(response_status),
    response_body = sqlc.narg(response_body),
    last_error = sqlc.arg(last_error),
    locked_at = NULL,
    locked_by = NULL,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND locked_by = sqlc.arg(worker_id)
RETURNING *;

-- name: ReleaseWebhookDeliveryClaim :execrows
UPDATE webhook_deliveries
SET locked_at = NULL,
    locked_by = NULL,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND locked_by = sqlc.arg(worker_id);

-- name: RetryWebhookDelivery :one
UPDATE webhook_deliveries AS delivery
SET status = 'pending',
    next_attempt_at = now(),
    response_status = NULL,
    response_body = NULL,
    last_error = NULL,
    delivered_at = NULL,
    locked_at = NULL,
    locked_by = NULL,
    updated_at = now()
FROM webhook_events AS event
WHERE delivery.id = sqlc.arg(id)
  AND event.id = delivery.event_id
  AND event.team_id = sqlc.arg(team_id)
  AND delivery.status = 'failed'
RETURNING delivery.*;
