# Frontend security model

## Authentication & session
- The session is an opaque, backend-issued cookie (`dugble_session`); the frontend never reads it
  in the browser. The API is reached same-origin via the `/api/v1/*` rewrite, so the cookie is
  first-party. **Backend requirement:** `HttpOnly; Secure; SameSite=Lax` (or `Strict`).
- `proxy.ts` optimistically redirects cookie-less requests for `/dashboard`, `/team-invitations`,
  `/verify-email-change` to `/login?next=…`. Every protected root layout then calls
  `requireSession()`, which validates against the Go session store.
- `?next=` is validated server-side by `safeRedirectPath` (allow-listed in-app prefixes; rejects
  absolute, protocol-relative, backslash and control-character variants).
- MFA challenge tokens, TOTP secrets, recovery codes, API-token secrets and webhook signing
  secrets live only in component/mutation state (`gcTime: 0`) and are never written to the query
  cache, storage or URLs.
- Logout / account deletion clear the query cache and the active-team cookie. Any 401 inside
  `/dashboard` redirects to `/login`.

## CSRF
- Every unsafe request carries `X-CSRF-Token` fetched from `GET /csrf` (`lib/csrf-fetch.ts`).
- `form-action 'self'` and `SameSite` cookies provide defence in depth.

## Content Security Policy (`lib/security/csp.ts`)
- Authenticated and auth routes: per-request nonce + `'strict-dynamic'` (set in `proxy.ts`);
  no `'unsafe-inline'`/`'unsafe-eval'` for scripts in production.
- Marketing routes are statically generated and cannot carry a nonce, so their policy allows
  inline scripts; they handle no user data. All other directives are identical.
- Always: `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`,
  `connect-src 'self'`, `upgrade-insecure-requests`.
- Route groups own their root layouts so only nonce routes render dynamically.

## Other headers (`next.config.ts`)
HSTS (2y, preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin` (keeps reset/invite tokens out of cross-origin
referrers), restrictive `Permissions-Policy`, `COOP: same-origin`, no `X-Powered-By`.
Authenticated responses are `Cache-Control: private, no-store`.

## Input & output handling
- Every API response is validated with zod before use.
- Dynamic route params are validated (`isUuid` / `isTemplateIdentifier`) before reaching API
  paths, and every interpolated path segment is `encodeURIComponent`-encoded.
- URLs the app navigates to or renders as links: `https:` only for checkout, `http(s)`/`mailto`
  for user markdown — `javascript:`/`data:` are rendered as text.
- Email HTML previews render in `sandbox=""` iframes (no scripts, no same-origin).
- CSV exports neutralise spreadsheet formula injection.
- `dangerouslySetInnerHTML` is lint-banned; the single JSON-LD exception escapes `<`.

## Configuration
- `BACKEND_URL` and `NEXT_PUBLIC_BASE_URL` are required in production; `BACKEND_URL` must be https.
