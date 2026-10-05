// src/lib/active-team-cookie.ts
//
// Isomorphic helpers for the active-team cookie. The team ID is not a secret
// (the API authorises every request), but persisting it in a cookie rather
// than localStorage lets the server render and prefetch for the right team,
// eliminating the no-team → team flash and hydration mismatches.

export const ACTIVE_TEAM_COOKIE = "dugble_active_team";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Only well-formed UUIDs are accepted — the value is echoed into a request header. */
export function parseTeamId(value: string | null | undefined): string | null {
  return value && UUID.test(value) ? value.toLowerCase() : null;
}

/** Browser-only: persist (or clear, with `null`) the active team. */
export function writeActiveTeamCookie(teamId: string | null): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: the async Cookie Store API is not universally supported and the store needs a synchronous read at startup.
  document.cookie = teamId
    ? `${ACTIVE_TEAM_COOKIE}=${teamId}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`
    : `${ACTIVE_TEAM_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

/** Browser-only: read the active team from `document.cookie`. */
export function readActiveTeamCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${ACTIVE_TEAM_COOKIE}=`));
  return parseTeamId(match?.slice(ACTIVE_TEAM_COOKIE.length + 1));
}
