-- name: CreateEmailMessage :one
INSERT INTO email_messages (
    team_id,
    message_type,
    from_email,
    from_name,
    reply_to_email,
    to_email,
    to_name,
    subject,
    html_body,
    text_body,
    status,
    metadata
) VALUES (
    sqlc.arg(team_id),
    sqlc.arg(message_type),
    sqlc.arg(from_email),
    sqlc.narg(from_name),
    sqlc.narg(reply_to_email),
    sqlc.arg(to_email),
    sqlc.narg(to_name),
    sqlc.arg(subject),
    sqlc.narg(html_body),
    sqlc.narg(text_body),
    'queued',
    sqlc.arg(metadata)
)
RETURNING *;

-- name: GetEmailMessage :one
SELECT *
FROM email_messages
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id);

-- name: ListEmailMessages :many
SELECT
    id,
    message_type,
    from_email,
    from_name,
    reply_to_email,
    to_email,
    to_name,
    subject,
    status,
    provider,
    provider_message_id,
    error_code,
    error_message,
    metadata,
    queued_at,
    processing_at,
    submitted_at,
    delivered_at,
    failed_at,
    created_at,
    updated_at
FROM email_messages
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC, id DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);
