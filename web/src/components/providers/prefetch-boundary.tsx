// src/components/providers/prefetch-boundary.tsx

import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getQueryClient } from "@/config/query-client";
import { resolveActiveTeam } from "@/lib/active-team.server";
import { type ServerQueryName, serverQueries } from "@/lib/api/server-queries";

/**
 * Prefetches team-scoped queries on the server and streams them into the
 * client cache, so client components render with data on first paint instead
 * of a spinner. Failures are swallowed by `prefetchQuery` — the client hook
 * simply fetches as before.
 *
 * Usage: `<PrefetchBoundary queries={["wallet", "walletLedgerFirstPage"]}>…`
 */
export async function PrefetchBoundary({
  queries,
  children,
}: {
  queries: readonly ServerQueryName[];
  children: ReactNode;
}) {
  const { teamId } = await resolveActiveTeam();
  if (!teamId) return children;

  const queryClient = getQueryClient();
  await Promise.all(
    queries.map((name) =>
      queryClient.prefetchQuery(serverQueries[name](teamId)),
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
