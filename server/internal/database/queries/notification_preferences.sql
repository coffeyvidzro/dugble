-- name: UpsertCategoryNotificationPreference :one
INSERT INTO notification_preferences (
    team_id, recipient_id, category, workflow_id, channel, enabled
)
SELECT
    recipient.team_id,
    recipient.id,
    sqlc.arg(category),
    NULL,
    sqlc.arg(channel),
    sqlc.arg(enabled)
FROM notification_recipients AS recipient
WHERE recipient.id = sqlc.arg(recipient_id)
  AND recipient.team_id = sqlc.arg(team_id)
ON CONFLICT (team_id, recipient_id, category, channel)
WHERE workflow_id IS NULL
DO UPDATE SET
    enabled = EXCLUDED.enabled,
    updated_at = now()
RETURNING *;

-- name: UpsertWorkflowNotificationPreference :one
INSERT INTO notification_preferences (
    team_id, recipient_id, category, workflow_id, channel, enabled
)
SELECT
    recipient.team_id,
    recipient.id,
    workflow.category,
    workflow.id,
    sqlc.arg(channel),
    sqlc.arg(enabled)
FROM notification_recipients AS recipient
JOIN notification_workflows AS workflow
  ON workflow.id = sqlc.arg(workflow_id)
 AND workflow.team_id = recipient.team_id
WHERE recipient.id = sqlc.arg(recipient_id)
  AND recipient.team_id = sqlc.arg(team_id)
ON CONFLICT (team_id, recipient_id, workflow_id, channel)
WHERE workflow_id IS NOT NULL
DO UPDATE SET
    enabled = EXCLUDED.enabled,
    category = EXCLUDED.category,
    updated_at = now()
RETURNING *;

-- name: ListNotificationPreferences :many
SELECT *
FROM notification_preferences
WHERE team_id = sqlc.arg(team_id)
  AND recipient_id = sqlc.arg(recipient_id)
ORDER BY updated_at DESC, id DESC;

-- name: ResolveNotificationPreferences :many
SELECT *
FROM notification_preferences
WHERE team_id = sqlc.arg(team_id)
  AND recipient_id = sqlc.arg(recipient_id)
  AND channel = sqlc.arg(channel)
  AND (
      workflow_id = sqlc.arg(workflow_id)
      OR (workflow_id IS NULL AND category = sqlc.arg(category))
  )
ORDER BY (workflow_id IS NOT NULL) DESC;

-- name: DeleteNotificationPreference :execrows
DELETE FROM notification_preferences
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND recipient_id = sqlc.arg(recipient_id);
