-- name: CreateNotificationWorkflow :one
INSERT INTO notification_workflows (
    team_id, key, name, category, enabled
)
SELECT
    team.id, sqlc.arg(key), sqlc.arg(name), sqlc.arg(category), sqlc.arg(enabled)
FROM teams AS team
WHERE team.id = sqlc.arg(team_id)
  AND team.status = 'active'
RETURNING *;

-- name: GetNotificationWorkflow :one
SELECT workflow.*
FROM notification_workflows AS workflow
JOIN teams AS team ON team.id = workflow.team_id
WHERE workflow.id = sqlc.arg(id)
  AND workflow.team_id = sqlc.arg(team_id)
  AND team.status = 'active';

-- name: GetNotificationWorkflowByKey :one
SELECT workflow.*
FROM notification_workflows AS workflow
JOIN teams AS team ON team.id = workflow.team_id
WHERE workflow.team_id = sqlc.arg(team_id)
  AND workflow.key = sqlc.arg(key)
  AND team.status = 'active';

-- name: GetNotificationWorkflowForUpdate :one
SELECT *
FROM notification_workflows
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
FOR UPDATE;

-- name: ListNotificationWorkflows :many
SELECT workflow.*
FROM notification_workflows AS workflow
JOIN teams AS team ON team.id = workflow.team_id
WHERE workflow.team_id = sqlc.arg(team_id)
  AND team.status = 'active'
ORDER BY workflow.created_at DESC, workflow.id DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: UpdateNotificationWorkflow :one
UPDATE notification_workflows AS workflow
SET name = sqlc.arg(name),
    category = sqlc.arg(category),
    enabled = sqlc.arg(enabled),
    updated_at = now()
FROM teams AS team
WHERE workflow.id = sqlc.arg(id)
  AND workflow.team_id = sqlc.arg(team_id)
  AND team.id = workflow.team_id
  AND team.status = 'active'
RETURNING workflow.*;

-- name: SetNotificationWorkflowPublishedVersion :one
UPDATE notification_workflows
SET published_version_id = sqlc.arg(published_version_id),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
RETURNING *;
