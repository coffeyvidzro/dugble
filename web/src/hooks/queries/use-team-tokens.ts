// src/hooks/queries/use-team-tokens.ts

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptimisticListMutation } from "@/hooks/mutations/use-optimistic-list-mutation";
import { assertPermission } from "@/lib/api/assert-permission";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type CreateTeamTokenInput,
  createTeamTokenInputSchema,
  createTeamTokenResponseSchema,
  type TeamToken,
  teamTokenSchema,
  teamTokensListSchema,
  type UpdateTeamTokenInput,
  updateTeamTokenInputSchema,
} from "@/types/team-token";
import { useTeamPermissions } from "./use-team-permissions";

export function useTeamTokens() {
  const activeTeamId = useActiveTeamId();
  const { isLoading, isOwner, isAdmin } = useTeamPermissions();

  // Team tokens are owner/admin-only on the backend — members get a 403
  // ("team permission is required"), so don't fire the request for them.
  const canViewTokens = isOwner || isAdmin;

  return useQuery({
    queryKey: queryKeys.teamTokens.list(activeTeamId),
    queryFn: ({ signal }) =>
      apiGet("/team-tokens", teamTokensListSchema, {
        signal,
        teamId: activeTeamId,
      }),
    enabled: Boolean(activeTeamId) && !isLoading && canViewTokens,
    staleTime: 30_000,
  });
}

export function useCreateTeamToken() {
  const queryClient = useQueryClient();
  const activeTeamId = useActiveTeamId();
  const { isOwner } = useTeamPermissions();

  return useMutation({
    // The response carries the one-time token secret. Drop the finished
    // mutation (and the secret) as soon as the dialog stops observing it.
    gcTime: 0,
    mutationFn: async (input: CreateTeamTokenInput) => {
      assertPermission(isOwner, "Only team owners can create team tokens.");
      return apiMutate(
        "/team-tokens",
        "POST",
        createTeamTokenResponseSchema,
        createTeamTokenInputSchema.parse(input),
      );
    },
    onSuccess: (created) => {
      const token: TeamToken = {
        id: created.id,
        team_id: created.team_id,
        name: created.name,
        token_prefix: created.token_prefix,
        permissions: created.permissions,
        created_by: created.created_by,
        expires_at: created.expires_at,
        revoked_at: created.revoked_at ?? null,
        last_used_at: created.last_used_at ?? null,
        created_at: created.created_at,
        updated_at: created.updated_at,
      };
      queryClient.setQueryData<TeamToken[]>(
        queryKeys.teamTokens.list(activeTeamId),
        (current) => (current ? [token, ...current] : [token]),
      );
    },
  });
}

export function useUpdateTeamToken() {
  const activeTeamId = useActiveTeamId();
  const { isOwner } = useTeamPermissions();

  return useOptimisticListMutation<
    { tokenId: string; input: UpdateTeamTokenInput },
    TeamToken,
    TeamToken
  >({
    queryKey: queryKeys.teamTokens.list(activeTeamId),
    mutationFn: async ({ tokenId, input }) => {
      assertPermission(isOwner, "Only team owners can update team tokens.");
      return apiMutate(
        `/team-tokens/${encodeURIComponent(tokenId)}`,
        "PATCH",
        teamTokenSchema,
        updateTeamTokenInputSchema.parse(input),
      );
    },
    optimisticUpdate: (current, { tokenId, input }) =>
      current?.map((t) => (t.id === tokenId ? { ...t, ...input } : t)),
    reconcile: (current, updated) =>
      current?.map((t) => (t.id === updated.id ? updated : t)),
  });
}

export function useRevokeTeamToken() {
  const activeTeamId = useActiveTeamId();
  const { isOwner } = useTeamPermissions();

  return useOptimisticListMutation<string, TeamToken, TeamToken>({
    queryKey: queryKeys.teamTokens.list(activeTeamId),
    mutationFn: async (tokenId) => {
      assertPermission(isOwner, "Only team owners can revoke team tokens.");
      return apiMutate(
        `/team-tokens/${encodeURIComponent(tokenId)}`,
        "DELETE",
        teamTokenSchema,
      );
    },
    optimisticUpdate: (current, tokenId) =>
      current?.filter((t) => t.id !== tokenId),
  });
}
