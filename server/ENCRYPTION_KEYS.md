# Encryption key lifecycle

`ENCRYPTION_KEYS` is an ordered comma-separated keyring. Each entry is
`key-id:base64-encoded-32-byte-key`; the first entry is the active encryption
key and the remaining entries are decrypt-only fallback keys.

## Rotate a key

1. Generate a random 32-byte key and give it a unique, immutable identifier.
2. Prepend the new entry to `ENCRYPTION_KEYS`, retain every previous entry, and
   deploy this keyring to all API and rotation-command instances.
3. Run `go run ./cmd/keyrotate` from `server/` with `DATABASE_URL` and the same
   `ENCRYPTION_KEYS`. The command exits non-zero if any persisted secret cannot
   be decrypted. It is idempotent and uses compare-and-swap updates.
4. Run the command again and confirm `rotated=0` before removing an old key.
5. Keep the immediately previous key deployed for at least the maximum OIDC
   login-state lifetime (10 minutes), because those ephemeral PKCE verifiers
   are not included in the bulk rotation.
6. Remove retired keys from every instance and secret store.

Application reads also lazily rewrap TOTP and OIDC client secrets with the
primary key. `MFA_ENCRYPTION_KEY` remains a temporary legacy fallback for
existing deployments; new deployments should use only `ENCRYPTION_KEYS`.
