"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";
import { apiGet, apiGetPage, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId, useSetActiveTeamId } from "@/store/active-team-store";
import {
  type CreateTeamInput,
  createTeamInputSchema,
  type Team,
  type TeamsQueryParams,
  teamListItemSchema,
  teamSchema,
  type UpdateTeamInput,
  updateTeamInputSchema,
} from "@/types/team";

export function useTeams(params: TeamsQueryParams = {}) {
  return useQuery({
    queryKey: queryKeys.teams.list(params),
    queryFn: ({ signal }) =>
      apiGetPage(endpoints.teams(params), teamListItemSchema, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teams.detail(teamId),
    queryFn: ({ signal }) =>
      apiGet(`/teams/${encodeURIComponent(teamId)}`, teamSchema, {
        signal,
        teamId,
      }),
    enabled: Boolean(teamId),
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const setActiveTeamId = useSetActiveTeamId();

  return useMutation({
    mutationFn: (input: CreateTeamInput) =>
      apiMutate(
        "/teams",
        "POST",
        teamSchema,
        createTeamInputSchema.parse(input),
      ),
    onSuccess: (team) => {
      queryClient.setQueryData(queryKeys.teams.detail(team.id), team);
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.lists(),
      });
      setActiveTeamId(team.id);
    },
  });
}

export function useUpdateTeam(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTeamInput) =>
      apiMutate(
        `/teams/${encodeURIComponent(teamId)}`,
        "PATCH",
        teamSchema,
        updateTeamInputSchema.parse(input),
        { teamId },
      ),
    onSuccess: (team: Team) => {
      queryClient.setQueryData(queryKeys.teams.detail(teamId), team);
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.lists(),
      });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const activeTeamId = useActiveTeamId();
  const setActiveTeamId = useSetActiveTeamId();

  return useMutation({
    mutationFn: (teamId: string) =>
      apiMutate(
        `/teams/${encodeURIComponent(teamId)}`,
        "DELETE",
        teamSchema,
        undefined,

        { teamId },
      ),
    onSuccess: (_data, teamId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.lists(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.teams.detail(teamId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.teams.members(teamId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.teams.invitations(teamId),
      });

      if (activeTeamId === teamId) {
        setActiveTeamId(null);
        queryClient.removeQueries({
          queryKey: queryKeys.teamTokens.list(teamId),
        });
        queryClient.removeQueries({
          queryKey: queryKeys.webhooks.list(teamId),
        });
      }
    },
  });
}
