# Refactor notes

Enterprise refactor of the Dugble dashboard, delivered in cumulative phases.
Each phase zip contains the entire codebase up to and including that phase.

## Phase 1 — Dead code removal & cleanup

### Metrics

| | Before | After |
|---|---|---|
| TypeScript files | 746 | 600 |
| Lines of code | 81,763 | 48,286 |
| `'use client'` files | 256 | 210 |
| Files unreachable from any route | 57 | 1 (`ui/skeleton.tsx`, kept for Phase 3) |
| Rules-of-Hooks violations | 9 | 0 |

### Removed — no backend support

- Routes: `/dashboard/email/logs`, `/dashboard/billing/transactions`, `/dashboard/developers/api-keys` (placeholder).
- Hooks calling undocumented endpoints: `use-api-keys` (`/api-keys`), `use-message-logs` (`/messages`).
- Test/live environment store and the `X-Dugble-Environment` header.
- Mock providers and seed data: `BroadcastsProvider`, `TemplatesProvider`, domains mock store.
- Wallet: auto-recharge, saved cards, bank transfer, USDT, manual payment, alerts/limits.
- Domains: inbound "receiving" UI and copy (only TLS is mutable).
- Security: IP allowlist, login protection, activity log, password age, mocked sessions/2FA.
- Duplicate 2FA flow in Profile; US sender-number types and the sender-ID compat shim.
- ~19,000 lines of commented-out code.

### Changed

- Dashboard overview and quick start use documented endpoints (team tokens, `/emails`, `/sms`).
- Security page: server component; password change wired to `PATCH /users/password`.
- `RequireActiveTeam` gate fixes hooks-after-early-return crashes in 14 team-scoped views.
- Shared primitives: `ConfirmDialog`, `CopyButton`, `useCopyToClipboard`, `lib/avatar.ts`,
  `lib/validation/password.ts`, `lib/csv.ts`.
- CSV exports neutralise spreadsheet formula injection (CWE-1236).
- Template categories/statuses derived from the API schema.
- Packages: removed `immer`, `@radix-ui/react-popover`, `@hugeicons/*`; `shadcn` and
  `@types/mdx` moved to dev; added `server-only` and a `typecheck` script.
- `.env.example`, `.gitattributes` (LF), repo-wide line-ending and whitespace normalisation.

### Open items carried forward

1. **Login MFA challenge is not implemented** (`login-form.tsx` TODO). Must land before
   2FA enrolment returns — Phase 2.
2. `PATCH /users/password` accepts no current password — backend should require it or a step-up.
3. Email/SMS query keys are not team-scoped — possible cross-team cache bleed — Phase 2.
4. `BACKEND_URL` silently defaults to `localhost` in production — Phase 4.
5. `useEffect` state syncing (debounced search reset, default sender) — Phase 2.
6. API areas without UI (topics, contact properties, SMS opt-outs, audit events,
   webhook event/delivery history) — follow-up, out of scope.

> **Phase 1 build issue (fixed in Phase 2):** `store/active-team-store.ts` still used
> Zustand's `immer` middleware after `immer` was removed, so the Phase 1 zip does not build.

### Verification

Dependencies could not be installed in the refactor environment. Checks performed:
local-consistency typecheck (externals shimmed; zero new errors), import-graph reachability,
unused-export analysis, Rules-of-Hooks scan, `any` scan.

Run locally:

```bash
bun install && bun run typecheck && bun run build && bun run lint && bun test
```

## Phase 2 — Data layer & state

### Security & authentication

- **Login MFA challenge** (`components/auth/mfa-challenge-form.tsx`): TOTP or recovery code via
  `/auth/login/mfa/*`. Challenge token held in memory only. Successful sign-in clears the query cache.
- **Security page** on real endpoints (`hooks/queries/use-security.ts`, `types/security.ts`):
  - 2FA enrol: `/auth/mfa/totp/enroll` → QR (`qrcode.react`) + setup key → `/totp/confirm` →
    recovery codes shown once (download available). Secret/codes live only in mutation state
    and are reset when the dialog closes (`gcTime: 0`).
  - 2FA disable: step-up via `/auth/mfa/verify` or `/auth/mfa/recovery`, then `DELETE /auth/mfa`.
  - Sessions: `GET /sessions`, revoke one (`DELETE /sessions/:id`) or others (`DELETE /sessions/others`).
- Logout and account deletion clear the query cache **and** the persisted active team.
- 401s from queries *and* mutations redirect to `/login`, but only on `/dashboard/*` routes
  (auth pages handle 401 inline).
- Email-verification links guard against double submission of single-use tokens.

### Team-scoped data layer

- `lib/api/query-keys.ts`: single factory, single `["dugble"]` root. Lists, analytics and billing
  keys carry the team ID; `lists()` without a team is an invalidation prefix across teams.
- `lib/api/fetcher.ts`: queries pass the team from their key as an explicit `X-Team-ID`, so a
  team switch mid-flight can't write team B's response into team A's cache.
- `lib/api/team-placeholder.ts`: `keepPreviousTeamData` replaces `keepPreviousData` so paginated
  views never show another team's rows as placeholder data.
- Contacts use the shared key factory (duplicate local factory removed).

### State management

- `useEffect` state syncing removed: dialog resets and sidebar portal follow now adjust state
  during render; default sender/domain are derived; template preview is a `useQuery`;
  webhook test fires from the click event; debounced search via `useDebouncedCallback`.
- Remaining `useEffect`s are legitimate external-system syncs (DOM listeners, timers, the
  persisted active-team store, one-shot token verification).
- URL state with `nuqs` (`NuqsAdapter` in `AppProviders`): SMS history filters + pagination.
  Filter changes reset the page in the same update.
- Zustand active-team store: `immer` removed, targeted selectors (`useActiveTeamId`,
  `useSetActiveTeamId`), `resetActiveTeam()`.
- `useApprovedSenderIds` returns a memoised array.
- Shared helpers: `lib/format-date.ts` (`formatDate`, `formatDateTime`, `formatRelativeTime`
  replace 6 copies), `hooks/use-is-client.ts`, `hooks/use-debounced-callback.ts`.

### Packages

Added `nuqs`, `qrcode.react`.

### Open items

1. Server prefetch (`HydrationBoundary`) moves to Phase 3: it needs the active team readable on
   the server, i.e. persisted in a cookie rather than `localStorage`.
2. The sessions API doesn't identify the current session; revoking warns that it may sign you out.
3. Only SMS history uses URL state so far; other list pages move to `nuqs` during Phase 3's
   component decomposition.

## Phase 3 — Server-first architecture

### Active team resolved on the server

- `store/active-team-store.tsx`: context-scoped Zustand store (no module-level state on the server,
  so nothing leaks between requests), persisted in the `dugble_active_team` cookie
  (`lib/active-team-cookie.ts`, UUID-validated) instead of `localStorage`.
- `lib/active-team.server.ts` → `resolveActiveTeam()` (per-request `cache`): cookie team if the user
  still belongs to it, else their first team. **Fixes:** users with teams saw "No team selected"
  until they opened the switcher, and SSR/CSR disagreed on the team (hydration mismatch).
- The dashboard layout seeds the store and the team switcher's query, so both render correctly
  on first paint.

### Server prefetch + hydration

- `lib/api/server.ts`: `server-only` authenticated GET that forwards only the session cookie,
  sends `X-Team-ID`, validates with the same zod schemas as the client, `cache: "no-store"`.
- `lib/api/endpoints.ts`: path builders shared by client hooks and the server.
- `lib/api/server-queries.ts`: server counterparts of client hooks with **identical query keys**.
- `components/providers/prefetch-boundary.tsx`: `<PrefetchBoundary queries={[…]}>` prefetches and
  dehydrates into `HydrationBoundary`. Used on overview, SMS, email, email metrics, domains,
  wallet, plan, webhooks, sender IDs, segments.

### Route boundaries

- `dashboard/loading.tsx` (skeleton via `PageSkeleton`), `dashboard/not-found.tsx`.
- `error.tsx` for the dashboard and each section (sms, email, billing, audience, settings,
  developers) via `SegmentError`, which shows the error digest but never raw messages.

### Code splitting

- Command palette (and its route index) is a lazy chunk loaded after hydration.
- The 2FA enrolment dialog (QR library) and the per-row template preview sheet load on demand.

### Components

- `useSmsComposer` extracted from `ComposeSmsForm` (state/derivation/submission vs. layout).
- SMS composer enforces the API's 50-message batch limit with an inline error.
- `'use client'` removed from components with no client features (`AuthShell`, `NavPanel`).
- URL state (`nuqs`) for campaigns and sender-ID status filters.

### Open items

1. Auth pages render `AuthShell` inside client forms; moving the shell to server pages is a
   follow-up.
2. `SendEmailDialog`/`CreateTokenDialog` bundle trigger + content; splitting them would allow lazy loading.
3. Remaining large components (template editor, campaign builder, team tokens) — decompose in Phase 5.
4. Broadcasts, emails, contacts and templates lists still keep filters in component state.

## Phase 4 — Security hardening

See `SECURITY.md` for the resulting security model.

### Changes

- **CSP** (`lib/security/csp.ts`): nonce + `strict-dynamic` on authenticated/auth routes via
  `proxy.ts`; static policy for marketing via `next.config.ts`. `frame-ancestors 'none'`,
  `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `connect-src 'self'` everywhere.
- **Root layouts per route group** (`components/layout/root-document.tsx`): `(auth)`, `(account)`,
  `(dashboard)` read the nonce (dynamic); `(marketing)` stays static. `team-invitations` and
  `verify-email-change` moved into `(account)` (URLs unchanged). `app/global-not-found.tsx`
  (`experimental.globalNotFound`) handles unmatched URLs.
- **Headers**: HSTS (prod), nosniff, `X-Frame-Options: DENY`, strict referrer policy,
  `Permissions-Policy`, COOP, `poweredByHeader: false`; `Cache-Control: private, no-store` on
  authenticated responses.
- **proxy.ts**: gates `/dashboard`, `/team-invitations`, `/verify-email-change` with
  `/login?next=…`. **Fixed:** signed-in users were redirected from *every* marketing page
  (`/pricing`, `/blog`, …) to `/dashboard`.
- **Open redirect**: `safeRedirectPath` validates `?next=` on the server; login honours it, so
  invitation/email-change links now survive sign-in (previously the token was lost).
- **Env**: `BACKEND_URL` (https) and `NEXT_PUBLIC_BASE_URL` required in production; `NODE_ENV`
  accepts `test` (Bun tests previously failed env validation).
- **Path injection**: `[id]` routes validate params (`isUuid` / `isTemplateIdentifier`) and
  `notFound()` otherwise; 83 interpolated API path segments are `encodeURIComponent`-encoded.
- **URL sinks**: hosted-checkout URLs must be `https:` (zod); broadcast markdown drops
  `javascript:`/`data:` links (previously a stored-XSS vector between team members).
- **Secrets**: token-creation, webhook-creation and secret-rotation mutations use `gcTime: 0`.
- **Lint**: Biome `noDangerouslySetInnerHtml` re-enabled; single justified JSON-LD exception.
- **Tests**: `lib/security/safe-redirect.test.ts`, `lib/security/security.test.ts`.

### Verification

Security logic (redirect validation incl. encoded traversal, CSP, param guards) was executed
with `tsx` in the refactor environment: all checks pass.

### Open items

1. Backend: confirm session cookie flags (`HttpOnly; Secure; SameSite`), require the current
   password (or step-up) on `PATCH /users/password`, and identify the current session in
   `GET /sessions`.
2. Consider `Content-Security-Policy-Report-Only` + a report endpoint before enforcing in
   production, to catch any third-party script not yet accounted for.
3. `experimental.globalNotFound` requires Next ≥ 15.4 (project is on 16.2).

## Phase 5 — Performance, types & polish

### Type safety
- `tsconfig`: target ES2022, `lib: es2023`, `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noImplicitReturns`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`;
  `allowJs` removed. Index-access sites fixed (chart paths, mini-chart ticks, marketing demos,
  sender-ID default country, command-palette effect return).

### Bugs fixed
- **"Create & publish" on a new template** published to `/templates//publish`: the publish
  mutation captured the empty ID at render. `usePublishTemplate()` now takes the ID at `mutate`.

### Decomposition & DRY
- Template editor: pure `template-form-model.ts` (form ↔ API mapping, preview interpolation)
  with unit tests; editor down from 331 → 250 lines.
- Team tokens: `TeamTokenRow` extracted; revoke uses the shared `ConfirmDialog`.
- `toDateTimeLocalValue` → `lib/format-date.ts`; `errorMessage` → `lib/errors.ts`
  (5 duplicates removed).
- `BrandMark` (next/image) replaces the remaining raw `<img>` tags.
- Template-literal `className`s converted to `cn()`.

### URL state
- Templates (search, category, status, grid/list) and broadcasts (search, status, sort, page)
  now use `nuqs`. With SMS history, campaigns and sender IDs, all list views are URL-driven
  except contacts (infinite scroll) and emails (server pagination + local search).

### Tooling
- `knip.json`, `@next/bundle-analyzer` (`bun run analyze`), `bun run check`.
- `.github/workflows/ci.yml`: typecheck, lint, knip, tests, build on every PR.
  Commit `bun.lock` — CI installs with `--frozen-lockfile`.
- `README.md` documents architecture and conventions.

### Open items
1. The harness can't fully type-check against real library types; run `bun run typecheck` —
   `noUncheckedIndexedAccess` may surface a few additional sites (e.g. regex match groups).
2. `SendEmailDialog` / `CreateTokenDialog` still bundle trigger + content (lazy-load candidates).
3. Campaign builder (242 lines) is already split into step components; a `useCampaignBuilder`
   hook extraction would mirror `useSmsComposer`.
4. Consider React Compiler (`reactCompiler: true`) and then removing most manual memoisation.

## Phase 5.1 — First real type-check fixes

Found by running `tsc` against real library types (not available in the refactor environment):

- `deliverability-chart.tsx`: axis tick read `series[index]` unchecked (`noUncheckedIndexedAccess`).
- `campaign-status-badge.tsx`: the default status config wasn't typed as `StatusConfig`, so
  `config.pulse` didn't exist on the union.
- `use-sms-composer.ts`: single-recipient send read `recipients[0]` unchecked.
- `delete-team-dialog.tsx`: stray `ss` prop on the delete button (**pre-existing** typo in the
  original code).
- `bun:test` imports had no types → added `@types/bun` (this also typed `test.each` callbacks;
  the pre-existing `session-resolver`/`metagraph` tests were affected too).
- `typecheck` now runs `next typegen` first so stale `.next` route types can't break it.
- `tsconfig.json` keeps `allowJs: true`, which Next.js re-adds automatically.

## Phase 5.2 — Lint findings (applied to the Biome-formatted tree)

Real fixes:
- **Template variables editor keyed rows by array index** — deleting a middle variable moved
  input state/focus onto the wrong row. Variables now carry a client-only `id`.
- Regex `exec` loops (`content-preview`, `markdown-to-html`, `code-highlight`) → `matchAll`,
  removing shared `lastIndex` state on module-level global regexes.
- Non-null assertions removed (`plan-overview`, `compose-broadcast-view`, `portal-rail`) via
  narrowing / a type-guard filter.
- Command-palette scope reset moved from an effect to render-time adjustment.
- Verify-email effects declare `mutate` dependencies (stable; token guard prevents re-submits).
- `forEach` expression callbacks → `for…of`; missing `type="button"`; unused imports; optional
  chains that preserve TypeScript narrowing.
- `autoFocus` removed from inputs inside dialogs (the dialog manages initial focus).

Justified suppressions (each carries its reason inline): index keys on static/derived content
(legal copy, code samples, markdown preview), `document.cookie` for the synchronous active-team
read, `autoFocus` on the MFA code step and the event-picker search, `role="dialog"` on three
custom modals, and the pointer-only mobile-nav backdrop.
