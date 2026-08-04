-- name: CreateNotificationRun :one
INSERT INTO notification_runs (
    team_id, workflow_id, workflow_version_id, recipient_id,
    status, trigger_key, data, scheduled_at
)
SELECT
    workflow.team_id,
    workflow.id,
    version.id,
    recipient.id,
    'queued',
    sqlc.narg(trigger_key),
    sqlc.arg(data),
    sqlc.narg(scheduled_at)
FROM notification_workflows AS workflow
JOIN notification_workflow_versions AS version
  ON version.id = sqlc.arg(workflow_version_id)
 AND version.workflow_id = workflow.id
 AND version.team_id = workflow.team_id
JOIN notification_recipients AS recipient
  ON recipient.id = sqlc.arg(recipient_id)
 AND recipient.team_id = workflow.team_id
JOIN teams AS team ON team.id = workflow.team_id
WHERE workflow.id = sqlc.arg(workflow_id)
  AND workflow.team_id = sqlc.arg(team_id)
  AND workflow.enabled = true
  AND version.status = 'published'
  AND team.status = 'active'
RETURNING *;

-- name: GetNotificationRun :one
SELECT run.*
FROM notification_runs AS run
JOIN teams AS team ON team.id = run.team_id
WHERE run.id = sqlc.arg(id)
  AND run.team_id = sqlc.arg(team_id)
  AND team.status = 'active';

-- name: GetNotificationRunForUpdate :one
SELECT *
FROM notification_runs
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
FOR UPDATE;

-- name: ListNotificationRuns :many
SELECT run.*
FROM notification_runs AS run
JOIN teams AS team ON team.id = run.team_id
WHERE run.team_id = sqlc.arg(team_id)
  AND team.status = 'active'
ORDER BY run.created_at DESC, run.id DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: ClaimNotificationRuns :many
WITH candidates AS (
    SELECT run.id
    FROM notification_runs AS run
    JOIN teams AS team ON team.id = run.team_id
    WHERE run.status IN ('queued', 'waiting')
      AND COALESCE(run.scheduled_at, run.created_at) <= now()
      AND team.status = 'active'
    ORDER BY COALESCE(run.scheduled_at, run.created_at), run.created_at
    FOR UPDATE OF run SKIP LOCKED
    LIMIT sqlc.arg(limit_count)
)
UPDATE notification_runs AS run
SET status = 'running',
    started_at = COALESCE(run.started_at, now()),
    updated_at = now()
FROM candidates
WHERE run.id = candidates.id
RETURNING run.*;

-- name: MarkNotificationRunRunning :one
UPDATE notification_runs
SET status = 'running',
    started_at = COALESCE(started_at, now()),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND status IN ('queued', 'waiting')
RETURNING *;

-- name: MarkNotificationRunWaiting :one
UPDATE notification_runs
SET status = 'waiting',
    scheduled_at = sqlc.arg(scheduled_at),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND status = 'running'
RETURNING *;

-- name: MarkNotificationRunCompleted :one
UPDATE notification_runs
SET status = 'completed',
    completed_at = now(),
    scheduled_at = NULL,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND status IN ('running', 'waiting')
RETURNING *;

-- name: MarkNotificationRunFailed :one
UPDATE notification_runs
SET status = 'failed',
    failed_at = now(),
    scheduled_at = NULL,
    error_code = sqlc.narg(error_code),
    error_message = sqlc.narg(error_message),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND status IN ('queued', 'running', 'waiting')
RETURNING *;

-- name: CancelNotificationRun :one
UPDATE notification_runs
SET status = 'canceled',
    canceled_at = now(),
    scheduled_at = NULL,
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND status IN ('queued', 'running', 'waiting')
RETURNING *;
