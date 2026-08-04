-- name: CreateInboxMessage :one
INSERT INTO inbox_messages (
    team_id, category, priority, title, body, data, actions, source, source_id
)
SELECT
    team.id, sqlc.arg(category), sqlc.arg(priority), sqlc.arg(title),
    sqlc.arg(body), sqlc.arg(data), sqlc.arg(actions), sqlc.arg(source),
    sqlc.narg(source_id)
FROM teams AS team
WHERE team.id = sqlc.arg(team_id)
  AND team.status = 'active'
RETURNING *;

-- name: GetInboxMessage :one
SELECT message.*
FROM inbox_messages AS message
JOIN teams AS team ON team.id = message.team_id
WHERE message.id = sqlc.arg(id)
  AND message.team_id = sqlc.arg(team_id)
  AND team.status = 'active';

-- name: GetInboxMessageBySource :one
SELECT message.*
FROM inbox_messages AS message
JOIN teams AS team ON team.id = message.team_id
WHERE message.team_id = sqlc.arg(team_id)
  AND message.source = sqlc.arg(source)
  AND message.source_id = sqlc.arg(source_id)
  AND team.status = 'active'
ORDER BY message.created_at DESC
LIMIT 1;

-- name: ListInboxMessages :many
SELECT message.*
FROM inbox_messages AS message
JOIN teams AS team ON team.id = message.team_id
WHERE message.team_id = sqlc.arg(team_id)
  AND team.status = 'active'
ORDER BY message.created_at DESC, message.id DESC
LIMIT sqlc.arg(limit_count)
OFFSET sqlc.arg(offset_count);
