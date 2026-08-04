-- name: CreateNotificationStepRun :one
INSERT INTO notification_step_runs (
    team_id, run_id, step_key, step_type, channel, sequence,
    status, available_at, input
)
SELECT
    run.team_id,
    run.id,
    sqlc.arg(step_key),
    sqlc.arg(step_type),
    sqlc.narg(channel),
    sqlc.arg(sequence),
    sqlc.arg(status),
    sqlc.narg(available_at),
    sqlc.arg(input)
FROM notification_runs AS run
WHERE run.id = sqlc.arg(run_id)
  AND run.team_id = sqlc.arg(team_id)
RETURNING *;

-- name: GetNotificationStepRun :one
SELECT *
FROM notification_step_runs
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id);

-- name: GetNotificationStepRunForUpdate :one
SELECT *
FROM notification_step_runs
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
FOR UPDATE;

-- name: ListNotificationStepRuns :many
SELECT *
FROM notification_step_runs
WHERE run_id = sqlc.arg(run_id)
  AND team_id = sqlc.arg(team_id)
ORDER BY sequence, created_at, id;

-- name: ClaimRunnableNotificationStepRuns :many
WITH candidates AS (
    SELECT step.id
    FROM notification_step_runs AS step
    JOIN notification_runs AS run
      ON run.id = step.run_id
     AND run.team_id = step.team_id
    JOIN teams AS team ON team.id = step.team_id
    WHERE step.status IN ('pending', 'waiting')
      AND COALESCE(step.available_at, step.created_at) <= now()
      AND run.status IN ('running', 'waiting')
      AND team.status = 'active'
    ORDER BY COALESCE(step.available_at, step.created_at), step.sequence
    FOR UPDATE OF step SKIP LOCKED
    LIMIT sqlc.arg(limit_count)
)
UPDATE notification_step_runs AS step
SET status = 'running',
    attempt_count = step.attempt_count + 1,
    started_at = COALESCE(step.started_at, now()),
    updated_at = now()
FROM candidates
WHERE step.id = candidates.id
RETURNING step.*;

-- name: MarkNotificationStepWaiting :one
UPDATE notification_step_runs
SET status = 'waiting',
    available_at = sqlc.arg(available_at),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND status = 'running'
RETURNING *;

-- name: CompleteNotificationEmailStep :one
UPDATE notification_step_runs
SET status = 'completed',
    email_message_id = sqlc.arg(email_message_id),
    output = sqlc.arg(output),
    completed_at = now(),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND step_type = 'email'
  AND status = 'running'
RETURNING *;

-- name: CompleteNotificationSMSStep :one
UPDATE notification_step_runs
SET status = 'completed',
    sms_message_id = sqlc.arg(sms_message_id),
    output = sqlc.arg(output),
    completed_at = now(),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND step_type = 'sms'
  AND status = 'running'
RETURNING *;

-- name: CompleteNotificationInboxStep :one
UPDATE notification_step_runs
SET status = 'completed',
    inbox_message_id = sqlc.arg(inbox_message_id),
    output = sqlc.arg(output),
    completed_at = now(),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND step_type = 'inbox'
  AND status = 'running'
RETURNING *;

-- name: CompleteNotificationControlStep :one
UPDATE notification_step_runs
SET status = 'completed',
    output = sqlc.arg(output),
    completed_at = now(),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND step_type IN ('delay', 'condition')
  AND status = 'running'
RETURNING *;

-- name: SkipNotificationStep :one
UPDATE notification_step_runs
SET status = 'skipped',
    output = sqlc.arg(output),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND status IN ('pending', 'waiting')
RETURNING *;

-- name: MarkNotificationStepFailed :one
UPDATE notification_step_runs
SET status = 'failed',
    error_code = sqlc.narg(error_code),
    error_message = sqlc.narg(error_message),
    failed_at = now(),
    updated_at = now()
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
  AND status = 'running'
RETURNING *;

-- name: CancelPendingNotificationSteps :many
UPDATE notification_step_runs
SET status = 'canceled',
    updated_at = now()
WHERE run_id = sqlc.arg(run_id)
  AND team_id = sqlc.arg(team_id)
  AND status IN ('pending', 'waiting')
RETURNING *;
