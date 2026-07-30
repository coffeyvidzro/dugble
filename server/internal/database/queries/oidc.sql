-- name: UpsertOIDCConnection :one
INSERT INTO oidc_connections (team_id, name, issuer_url, client_id, client_secret_ciphertext, allowed_domains, enabled, created_by)
VALUES (sqlc.arg(team_id), sqlc.arg(name), sqlc.arg(issuer_url), sqlc.arg(client_id), sqlc.arg(client_secret_ciphertext), sqlc.arg(allowed_domains), sqlc.arg(enabled), sqlc.arg(created_by))
ON CONFLICT (team_id) DO UPDATE SET name=excluded.name, issuer_url=excluded.issuer_url, client_id=excluded.client_id, client_secret_ciphertext=excluded.client_secret_ciphertext, allowed_domains=excluded.allowed_domains, enabled=excluded.enabled, updated_at=now()
RETURNING *;

-- name: GetOIDCConnectionByTeam :one
SELECT * FROM oidc_connections WHERE team_id=sqlc.arg(team_id);

-- name: GetOIDCConnection :one
SELECT * FROM oidc_connections WHERE id=sqlc.arg(id) AND enabled;

-- name: DeleteOIDCConnection :exec
DELETE FROM oidc_connections WHERE team_id=sqlc.arg(team_id);

-- name: CreateOIDCLoginState :exec
INSERT INTO oidc_login_states (state_hash, connection_id, code_verifier_ciphertext, nonce, expires_at)
VALUES (sqlc.arg(state_hash), sqlc.arg(connection_id), sqlc.arg(code_verifier_ciphertext), sqlc.arg(nonce), sqlc.arg(expires_at));

-- name: ConsumeOIDCLoginState :one
UPDATE oidc_login_states SET consumed_at=now()
WHERE state_hash=sqlc.arg(state_hash) AND consumed_at IS NULL AND expires_at > now()
RETURNING *;

-- name: ResolveOIDCIdentity :one
WITH existing_identity AS (
  SELECT user_id FROM external_identities WHERE external_identities.connection_id=sqlc.arg(connection_id) AND external_identities.subject=sqlc.arg(subject)
), existing_user AS (
  SELECT users.id FROM users JOIN team_members ON team_members.user_id=users.id
  WHERE lower(users.email)=lower(sqlc.arg(email)) AND team_members.team_id=sqlc.arg(team_id) AND team_members.status='active'
), created_user AS (
  INSERT INTO users (email, email_verified, name)
  SELECT sqlc.arg(email), true, sqlc.arg(name)
  WHERE NOT EXISTS (SELECT 1 FROM existing_identity) AND NOT EXISTS (SELECT 1 FROM existing_user)
  RETURNING id
), resolved AS (
  SELECT user_id AS id FROM existing_identity UNION ALL SELECT id FROM existing_user WHERE NOT EXISTS (SELECT 1 FROM existing_identity) UNION ALL SELECT id FROM created_user
), linked AS (
  INSERT INTO external_identities (user_id, connection_id, subject, email)
  SELECT id, sqlc.arg(connection_id), sqlc.arg(subject), sqlc.arg(email) FROM resolved
  ON CONFLICT (connection_id, subject) DO UPDATE SET email=excluded.email, last_login_at=now()
  RETURNING user_id
), membership AS (
  INSERT INTO team_members (team_id, user_id, role, status)
  SELECT sqlc.arg(team_id), user_id, 'member', 'active' FROM linked
  ON CONFLICT (team_id, user_id) DO NOTHING
)
SELECT users.* FROM users JOIN linked ON linked.user_id=users.id;
