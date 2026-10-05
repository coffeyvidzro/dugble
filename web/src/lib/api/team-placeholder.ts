import type { QueryKey } from "@tanstack/react-query";
import type { TeamScope } from "./query-keys";

export function keepPreviousTeamData(teamId: TeamScope) {
  return <TData>(
    previousData: TData | undefined,
    previousQuery: { queryKey: QueryKey } | undefined,
  ): TData | undefined =>
    previousQuery?.queryKey.includes(teamId) ? previousData : undefined;
}
