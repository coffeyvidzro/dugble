# Dugble Web

Marketing site and customer dashboard for **Dugble** — email & SMS API infrastructure for
A2P messaging (transactional alerts, OTPs, receipts). Next.js 16 (App Router), React 19,
TypeScript (strict), TanStack Query, Zustand, nuqs, Tailwind CSS 4, Biome, Bun.

## Getting started

```bash
cp .env.example .env.local      # point BACKEND_URL at the Go API
bun install
bun run dev                     # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `bun run check` | typecheck + lint + knip + tests (what CI runs, minus the build) |
| `bun run typecheck` | `tsc --noEmit` with `noUncheckedIndexedAccess` etc. |
| `bun run lint` / `lint:fix` | Biome lint + format check |
| `bun run knip` | unused files, exports and dependencies |
| `bun test` | unit tests (`*.test.ts`) |
| `bun run analyze` | production build with bundle analyzer |

## Architecture

```
src/
  app/
    (marketing)/   root layout, statically rendered, static CSP
    (auth)/        root layout, nonce CSP, redirects signed-in users
    (account)/     root layout, nonce CSP (team invitations, email change)
    (dashboard)/   root layout, nonce CSP, session + active team resolved on the server
  components/
    ui/            shadcn primitives (base-ui)
    dashboard/     feature folders (sms, email, audience, billing, team, security, …)
      shared/      cross-feature pieces (ConfirmDialog, CopyButton, RequireActiveTeam, …)
  hooks/queries/   one TanStack Query module per API resource
  lib/
    api/           fetcher (client), server fetch, query keys, endpoints, prefetch registry
    security/      CSP, safe redirects, safe URLs, route-param guards
  store/           Zustand (active team only)
  types/           zod schemas + inferred types per API resource
```

### Conventions

- **Server first.** Pages and layouts are Server Components. `'use client'` lives on leaf
  components that need state, effects, event handlers or browser APIs.
- **Server state = TanStack Query.** Every API call goes through `hooks/queries/*` and is
  validated with zod. Never `useEffect` + `fetch`. Keys come from `lib/api/query-keys.ts`;
  team-scoped keys include the team ID and requests pin `X-Team-ID` to it.
- **Server prefetch.** Wrap a page in `<PrefetchBoundary queries={[…]}>`; add new entries to
  `lib/api/server-queries.ts` with the *same key* as the client hook.
- **URL state = nuqs.** Filters, sort, pagination and view modes live in the URL.
- **Global UI state = Zustand** with targeted selectors. Today that's only the active team
  (cookie-backed so the server renders the right team).
- **No `useEffect` for derived or synchronised state.** Derive during render, adjust state
  during render when props change, or fire work from the event that caused it.
- **Types.** No `any`. API types are `z.infer` of the schemas in `types/`.
- **Styling.** Tailwind utilities; conditional classes via `cn()` (`clsx` + `tailwind-merge`).
- **Memoisation.** `useMemo`/`useCallback` only for non-trivial derivations or values passed
  to hooks' dependency arrays. (React Compiler is a candidate follow-up.)
- **Security.** See [SECURITY.md](SECURITY.md).

### Adding an API-backed feature

1. Schema + types in `src/types/<resource>.ts` (zod).
2. Keys in `lib/api/query-keys.ts` (team-scoped if the API uses `X-Team-ID`).
3. Hooks in `hooks/queries/use-<resource>.ts`; mutations invalidate `…lists()`.
4. Server page → client leaf components; optional `PrefetchBoundary`.
5. Validate any route param with `lib/security/route-params.ts`.

See `REFACTOR_NOTES.md` for the history of the enterprise refactor.
