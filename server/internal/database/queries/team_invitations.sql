-- name: CreateTeamInvitation :one
INSERT INTO team_invitations (
    team_id,
    email,
    role,
    token_hash,
    invited_by,
    expires_at
) VALUES (
    sqlc.arg(team_id),
    sqlc.arg(email),
    sqlc.arg(role),
    sqlc.arg(token_hash),
    sqlc.arg(invited_by),
    sqlc.arg(expires_at)
)
RETURNING *;

-- name: GetTeamInvitationByTokenHash :one
SELECT *
FROM team_invitations
WHERE token_hash = sqlc.arg(token_hash)
  AND status = 'pending'
  AND expires_at > now();

-- name: ListPendingTeamInvitations :many
SELECT *
FROM team_invitations
WHERE team_id = sqlc.arg(team_id)
  AND status = 'pending'
  AND expires_at > now()
ORDER BY created_at DESC;

-- name: AcceptTeamInvitation :one
UPDATE team_invitations
SET status = 'accepted',
    accepted_at = now(),
    updated_at = now()
WHERE token_hash = sqlc.arg(token_hash)
  AND status = 'pending'
  AND expires_at > now()
RETURNING *;

-- name: DeclineTeamInvitation :one
UPDATE team_invitations
SET status = 'declined',
    declined_at = now(),
    updated_at = now()
WHERE token_hash = sqlc.arg(token_hash)
  AND status = 'pending'
  AND expires_at > now()
RETURNING *;
