-- name: GetTeamIdentityPolicy :one
SELECT
    teams.id AS team_id,
    COALESCE(team_identity_policies.require_mfa, false)::boolean AS require_mfa,
    COALESCE(team_identity_policies.session_max_age_minutes, 43200)::integer AS session_max_age_minutes,
    team_identity_policies.updated_by,
    COALESCE(team_identity_policies.created_at, teams.created_at)::timestamptz AS created_at,
    COALESCE(team_identity_policies.updated_at, teams.created_at)::timestamptz AS updated_at
FROM teams
LEFT JOIN team_identity_policies ON team_identity_policies.team_id = teams.id
WHERE teams.id = sqlc.arg(team_id);

-- name: UpsertTeamIdentityPolicy :one
INSERT INTO team_identity_policies (
    team_id,
    require_mfa,
    session_max_age_minutes,
    updated_by
) VALUES (
    sqlc.arg(team_id),
    sqlc.arg(require_mfa),
    sqlc.arg(session_max_age_minutes),
    sqlc.arg(updated_by)
)
ON CONFLICT (team_id) DO UPDATE SET
    require_mfa = EXCLUDED.require_mfa,
    session_max_age_minutes = EXCLUDED.session_max_age_minutes,
    updated_by = EXCLUDED.updated_by,
    updated_at = now()
RETURNING *;
