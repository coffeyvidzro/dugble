-- name: CreateEmailMessage :one
INSERT INTO email_messages (
    team_id,
    idempotency_key,
    idempotency_hash,
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
    sqlc.narg(idempotency_key),
    sqlc.narg(idempotency_hash),
    sqlc.arg(message_type),
    sqlc.arg(from_email),
    sqlc.narg(from_name),
    sqlc.narg(reply_to_email),
    sqlc.arg(to_email),
    sqlc.narg(to_name),
    sqlc.arg(subject),
    sqlc.narg(html_body),
    sqlc.narg(text_body),
    sqlc.arg(status),
    sqlc.arg(metadata)
)
RETURNING *;

-- name: ListEmailMessages :many
SELECT *
FROM email_messages
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: GetEmailMessage :one
SELECT *
FROM email_messages
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id);

-- name: GetEmailMessageByIdempotencyKey :one
SELECT *
FROM email_messages
WHERE team_id = sqlc.arg(team_id)
  AND idempotency_key = sqlc.arg(idempotency_key)
LIMIT 1;
