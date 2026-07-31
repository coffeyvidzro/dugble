-- name: CreateSCIMToken :one
INSERT INTO scim_tokens(team_id,name,token_hash,created_by,expires_at) VALUES(sqlc.arg(team_id),sqlc.arg(name),sqlc.arg(token_hash),sqlc.arg(created_by),sqlc.narg(expires_at)) RETURNING *;
-- name: ListSCIMTokens :many
SELECT * FROM scim_tokens WHERE team_id=sqlc.arg(team_id) ORDER BY created_at DESC;
-- name: RevokeSCIMToken :exec
UPDATE scim_tokens SET revoked_at=now() WHERE id=sqlc.arg(id) AND team_id=sqlc.arg(team_id) AND revoked_at IS NULL;
-- name: GetActiveSCIMTokenByHash :one
SELECT * FROM scim_tokens WHERE token_hash=sqlc.arg(token_hash) AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now());
-- name: TouchSCIMToken :exec
UPDATE scim_tokens SET last_used_at=now() WHERE id=sqlc.arg(id) AND (last_used_at IS NULL OR last_used_at < now()-interval '5 minutes');
-- name: ListSCIMUsers :many
SELECT users.*, team_members.status AS membership_status, scim_external_ids.external_id, COALESCE(NULLIF(scim_external_ids.display_name,''), users.name) AS scim_name
FROM team_members JOIN users ON users.id=team_members.user_id LEFT JOIN scim_external_ids ON scim_external_ids.team_id=team_members.team_id AND scim_external_ids.user_id=users.id
WHERE team_members.team_id=sqlc.arg(team_id) AND (sqlc.narg(email)::text IS NULL OR lower(users.email)=lower(sqlc.narg(email)))
ORDER BY users.created_at, users.id LIMIT sqlc.arg(page_size) OFFSET sqlc.arg(page_offset);
-- name: CountSCIMUsers :one
SELECT count(*) FROM team_members JOIN users ON users.id=team_members.user_id WHERE team_members.team_id=sqlc.arg(team_id) AND (sqlc.narg(email)::text IS NULL OR lower(users.email)=lower(sqlc.narg(email)));
-- name: GetSCIMUser :one
SELECT users.*, team_members.status AS membership_status, scim_external_ids.external_id, COALESCE(NULLIF(scim_external_ids.display_name,''), users.name) AS scim_name
FROM team_members JOIN users ON users.id=team_members.user_id LEFT JOIN scim_external_ids ON scim_external_ids.team_id=team_members.team_id AND scim_external_ids.user_id=users.id
WHERE team_members.team_id=sqlc.arg(team_id) AND users.id=sqlc.arg(user_id);
-- name: ProvisionSCIMUser :one
WITH existing AS (
 SELECT users.id FROM users JOIN team_members ON team_members.user_id=users.id WHERE lower(users.email)=lower(sqlc.arg(email)) AND team_members.team_id=sqlc.arg(team_id)
), created AS (
 INSERT INTO users(email,email_verified,name) SELECT sqlc.arg(email),true,sqlc.arg(name) WHERE NOT EXISTS(SELECT 1 FROM existing) RETURNING id
), resolved AS (SELECT id FROM existing UNION ALL SELECT id FROM created), membership AS (
 INSERT INTO team_members(team_id,user_id,role,status) SELECT sqlc.arg(team_id),id,'member','active' FROM resolved ON CONFLICT(team_id,user_id) DO UPDATE SET status='active',updated_at=now() RETURNING user_id
), mapping AS (
 INSERT INTO scim_external_ids(team_id,user_id,external_id,display_name) SELECT sqlc.arg(team_id),membership.user_id,sqlc.arg(external_id),sqlc.arg(name) FROM membership
 ON CONFLICT(team_id,user_id) DO UPDATE SET external_id=excluded.external_id,display_name=excluded.display_name,updated_at=now() RETURNING user_id
)
SELECT users.* FROM users JOIN mapping ON mapping.user_id=users.id;
-- name: UpdateSCIMUser :exec
WITH member AS (UPDATE team_members SET status=sqlc.arg(status),updated_at=now() WHERE team_id=sqlc.arg(team_id) AND team_members.user_id=sqlc.arg(user_id) RETURNING team_members.user_id)
UPDATE scim_external_ids SET display_name=sqlc.arg(name),updated_at=now() FROM member WHERE scim_external_ids.team_id=sqlc.arg(team_id) AND scim_external_ids.user_id=member.user_id;
-- name: DeprovisionSCIMUser :exec
UPDATE team_members SET status='suspended',updated_at=now() WHERE team_id=sqlc.arg(team_id) AND user_id=sqlc.arg(user_id);
