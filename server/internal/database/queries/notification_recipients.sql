-- name: UpsertNotificationRecipient :one
INSERT INTO notification_recipients (
    team_id, external_id, email, phone, locale, timezone, data
)
SELECT
    team.id, sqlc.arg(external_id), sqlc.narg(email), sqlc.narg(phone),
    sqlc.narg(locale), sqlc.narg(timezone), sqlc.arg(data)
FROM teams AS team
WHERE team.id = sqlc.arg(team_id)
  AND team.status = 'active'
ON CONFLICT (team_id, external_id) DO UPDATE
SET email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    locale = EXCLUDED.locale,
    timezone = EXCLUDED.timezone,
    data = EXCLUDED.data,
    updated_at = now()
RETURNING *;

-- name: GetNotificationRecipient :one
SELECT recipient.*
FROM notification_recipients AS recipient
JOIN teams AS team ON team.id = recipient.team_id
WHERE recipient.id = sqlc.arg(id)
  AND recipient.team_id = sqlc.arg(team_id)
  AND team.status = 'active';

-- name: GetNotificationRecipientByExternalID :one
SELECT recipient.*
FROM notification_recipients AS recipient
JOIN teams AS team ON team.id = recipient.team_id
WHERE recipient.team_id = sqlc.arg(team_id)
  AND recipient.external_id = sqlc.arg(external_id)
  AND team.status = 'active';

-- name: ListNotificationRecipients :many
SELECT recipient.*
FROM notification_recipients AS recipient
JOIN teams AS team ON team.id = recipient.team_id
WHERE recipient.team_id = sqlc.arg(team_id)
  AND team.status = 'active'
ORDER BY recipient.created_at DESC, recipient.id DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);

-- name: UpdateNotificationRecipient :one
UPDATE notification_recipients AS recipient
SET email = sqlc.narg(email),
    phone = sqlc.narg(phone),
    locale = sqlc.narg(locale),
    timezone = sqlc.narg(timezone),
    data = sqlc.arg(data),
    updated_at = now()
FROM teams AS team
WHERE recipient.id = sqlc.arg(id)
  AND recipient.team_id = sqlc.arg(team_id)
  AND team.id = recipient.team_id
  AND team.status = 'active'
RETURNING recipient.*;
