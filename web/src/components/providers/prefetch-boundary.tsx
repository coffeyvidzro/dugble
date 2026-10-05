import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getQueryClient } from "@/config/query-client";
import { resolveActiveTeam } from "@/lib/active-team.server";
import { type ServerQueryName, serverQueries } from "@/lib/api/server-queries";

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
