-- name: CreateTeamWithOwner :one
WITH created_team AS (
    INSERT INTO teams (name, created_by)
    VALUES (sqlc.arg(name), sqlc.arg(owner_id))
    RETURNING *
), created_owner AS (
    INSERT INTO team_members (team_id, user_id, role, status)
    SELECT id, sqlc.arg(owner_id), 'owner', 'active'
    FROM created_team
    RETURNING team_id
)
SELECT created_team.*
FROM created_team
JOIN created_owner ON created_owner.team_id = created_team.id;

-- name: GetTeam :one
SELECT *
FROM teams
WHERE id = sqlc.arg(id);

-- name: ListTeamsForUser :many
SELECT t.*
FROM teams t
JOIN team_members tm ON tm.team_id = t.id
WHERE tm.user_id = sqlc.arg(user_id)
  AND tm.status = 'active'
  AND t.status = 'active'
ORDER BY t.created_at DESC;

-- name: UpdateTeam :one
UPDATE teams
SET name = sqlc.arg(name),
    updated_at = now()
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: DisableTeam :one
UPDATE teams
SET status = 'disabled',
    updated_at = now()
WHERE id = sqlc.arg(id)
RETURNING *;

-- name: CreateTeamMember :one
INSERT INTO team_members (
    team_id,
    user_id,
    role,
    status
) VALUES (
    sqlc.arg(team_id),
    sqlc.arg(user_id),
    sqlc.arg(role),
    sqlc.arg(status)
)
RETURNING *;

-- name: GetTeamMember :one
SELECT *
FROM team_members
WHERE team_id = sqlc.arg(team_id)
  AND user_id = sqlc.arg(user_id);

-- name: ListTeamMembers :many
SELECT *
FROM team_members
WHERE team_id = sqlc.arg(team_id)
ORDER BY created_at ASC;

-- name: UpdateTeamMemberRole :one
UPDATE team_members
SET role = sqlc.arg(role),
    updated_at = now()
WHERE team_id = sqlc.arg(team_id)
  AND user_id = sqlc.arg(user_id)
RETURNING *;

-- name: RemoveTeamMember :exec
DELETE FROM team_members
WHERE team_id = sqlc.arg(team_id)
  AND user_id = sqlc.arg(user_id);
