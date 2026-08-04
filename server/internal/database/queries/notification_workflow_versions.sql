-- name: CreateNotificationWorkflowVersion :one
INSERT INTO notification_workflow_versions (
    team_id, workflow_id, version, status, definition, published_at
)
SELECT
    workflow.team_id,
    workflow.id,
    sqlc.arg(version),
    sqlc.arg(status),
    sqlc.arg(definition),
    sqlc.narg(published_at)
FROM notification_workflows AS workflow
WHERE workflow.id = sqlc.arg(workflow_id)
  AND workflow.team_id = sqlc.arg(team_id)
RETURNING *;

-- name: GetNotificationWorkflowVersion :one
SELECT version.*
FROM notification_workflow_versions AS version
JOIN teams AS team ON team.id = version.team_id
WHERE version.id = sqlc.arg(id)
  AND version.team_id = sqlc.arg(team_id)
  AND team.status = 'active';

-- name: GetPublishedNotificationWorkflowVersion :one
SELECT version.*
FROM notification_workflow_versions AS version
JOIN notification_workflows AS workflow
  ON workflow.id = version.workflow_id
 AND workflow.team_id = version.team_id
JOIN teams AS team ON team.id = version.team_id
WHERE workflow.id = sqlc.arg(workflow_id)
  AND workflow.team_id = sqlc.arg(team_id)
  AND workflow.enabled = true
  AND version.id = workflow.published_version_id
  AND version.status = 'published'
  AND team.status = 'active';

-- name: ListNotificationWorkflowVersions :many
SELECT *
FROM notification_workflow_versions
WHERE workflow_id = sqlc.arg(workflow_id)
  AND team_id = sqlc.arg(team_id)
ORDER BY version DESC;

-- name: PublishNotificationWorkflowVersion :one
UPDATE notification_workflow_versions
SET status = 'published',
    published_at = COALESCE(published_at, now())
WHERE id = sqlc.arg(id)
  AND workflow_id = sqlc.arg(workflow_id)
  AND team_id = sqlc.arg(team_id)
  AND status = 'draft'
RETURNING *;

-- name: RetirePublishedNotificationWorkflowVersion :many
UPDATE notification_workflow_versions
SET status = 'retired'
WHERE workflow_id = sqlc.arg(workflow_id)
  AND team_id = sqlc.arg(team_id)
  AND status = 'published'
  AND id <> sqlc.arg(except_id)
RETURNING *;
