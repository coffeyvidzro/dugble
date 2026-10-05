// src/lib/api/team-placeholder.ts

import type { QueryKey } from "@tanstack/react-query";
import type { TeamScope } from "./query-keys";

/**
 * Team-aware replacement for TanStack's `keepPreviousData`.
 *
 * Keeping the previous page visible while the next one loads is good UX for
 * pagination and filters, but the stock helper would also show team A's rows
 * while team B's first request is in flight. This only reuses placeholder data
 * when the previous query belonged to the same team.
 */
export function keepPreviousTeamData(teamId: TeamScope) {
  return <TData>(
    previousData: TData | undefined,
    previousQuery: { queryKey: QueryKey } | undefined,
  ): TData | undefined =>
    previousQuery?.queryKey.includes(teamId) ? previousData : undefined;
}
