-- name: CreateSenderID :one
INSERT INTO sender_ids (
    team_id,
    name,
    country_code,
    purpose,
    provider,
    created_by
) VALUES (
    sqlc.arg(team_id),
    sqlc.arg(name),
    sqlc.arg(country_code),
    sqlc.arg(purpose),
    sqlc.narg(provider),
    sqlc.narg(created_by)
)
RETURNING *;

-- name: ListSenderIDs :many
SELECT *
FROM sender_ids
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at DESC;

-- name: GetSenderID :one
SELECT *
FROM sender_ids
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id);

-- name: DeleteSenderID :one
DELETE FROM sender_ids
WHERE id = sqlc.arg(id)
  AND team_id = sqlc.arg(team_id)
RETURNING *;
