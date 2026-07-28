-- name: CreateEmailMessage :one
INSERT INTO email_messages (
    team_id,
    sender_domain_id,
    delivery_provider,
    provider_region,
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
    metadata,
    recipients,
    headers,
    attachments,
    tags,
    scheduled_at
) VALUES (
    sqlc.arg(team_id),
    sqlc.narg(sender_domain_id),
    sqlc.arg(delivery_provider),
    sqlc.arg(provider_region),
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
    sqlc.arg(metadata),
    sqlc.arg(recipients),
    sqlc.arg(headers),
    sqlc.arg(attachments),
    sqlc.arg(tags),
    sqlc.narg(scheduled_at)
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
    team_id,
    to_email,
    to_name,
    subject,
    status,
    provider,
    queued_at,
    submitted_at,
    delivered_at,
    created_at
FROM email_messages
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);
