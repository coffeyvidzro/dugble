"use client";

import { useEffect } from "react";
import { useTeam, useTeams } from "@/hooks/queries/use-teams";
import { useActiveTeamId, useSetActiveTeamId } from "@/store/active-team-store";
import type { Team } from "@/types/team";

export type ActiveTeamResult =
  | { status: "pending" }
  | { status: "error"; error: Error }
  | { status: "empty" }
  | { status: "success"; team: Team };

function isInvalidActiveTeamError(
  error: unknown,
): error is Error & { isForbidden?: boolean; isNotFound?: boolean } {
  return (
    error instanceof Error &&
    ((error as { isForbidden?: boolean }).isForbidden === true ||
      (error as { isNotFound?: boolean }).isNotFound === true)
  );
}

export function useActiveTeam(): ActiveTeamResult {
  const activeTeamId = useActiveTeamId();
  const setActiveTeamId = useSetActiveTeamId();

  const fallbackQuery = useTeams({ page: 1, limit: 1 });
  const fallbackTeamId = fallbackQuery.data?.items[0]?.id;

  useEffect(() => {
    if (!activeTeamId && fallbackTeamId) {
      setActiveTeamId(fallbackTeamId);
    }
  }, [activeTeamId, fallbackTeamId, setActiveTeamId]);

  const teamQuery = useTeam(activeTeamId ?? "");

  // 👇 ADD THIS EFFECT: Self-heal stale/invalid active teams
  useEffect(() => {
    if (
      activeTeamId &&
      teamQuery.isError &&
      isInvalidActiveTeamError(teamQuery.error)
    ) {
      setActiveTeamId(null);
    }
  }, [activeTeamId, teamQuery.isError, teamQuery.error, setActiveTeamId]);

  if (!activeTeamId) {
    if (fallbackQuery.isPending) return { status: "pending" };
    if (fallbackQuery.isError)
      return { status: "error", error: fallbackQuery.error };
    if (!fallbackTeamId) return { status: "empty" };
    return { status: "pending" };
  }

  if (teamQuery.isPending) return { status: "pending" };
  if (teamQuery.isError) return { status: "error", error: teamQuery.error };
  return { status: "success", team: teamQuery.data };
}
