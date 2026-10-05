// src/hooks/queries/use-suppressions.ts

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptimisticListMutation } from "@/hooks/mutations/use-optimistic-list-mutation";
import { assertPermission } from "@/lib/api/assert-permission";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type CreateSuppressionInput,
  createdSuppressionSchema,
  type Suppression,
  suppressionDeletedSchema,
  suppressionsListSchema,
} from "@/types/suppression";
import { useTeamPermissions } from "./use-team-permissions";

export function useSuppressions() {
  const activeTeamId = useActiveTeamId();

  return useQuery({
    queryKey: queryKeys.suppressions.list(activeTeamId),
    queryFn: ({ signal }) =>
      apiGet("/suppressions", suppressionsListSchema, {
        signal,
        teamId: activeTeamId,
      }),
    enabled: Boolean(activeTeamId),
    staleTime: 30_000,
  });
}

export function useCreateSuppression() {
  const activeTeamId = useActiveTeamId();
  const { canManageTeam } = useTeamPermissions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSuppressionInput) => {
      assertPermission(
        canManageTeam,
        "Only admins and owners can add suppressions.",
      );

      return apiMutate("/suppressions", "POST", createdSuppressionSchema, {
        email: input.email.trim(),
      });
    },
    onSuccess: (created, input) => {
      const placeholder: Suppression = {
        id: created.id,
        email: input.email.trim(),
        origin: "dashboard",
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Suppression[]>(
        queryKeys.suppressions.list(activeTeamId),
        (current) => (current ? [placeholder, ...current] : [placeholder]),
      );

      queryClient.invalidateQueries({
        queryKey: queryKeys.suppressions.list(activeTeamId),
      });
    },
  });
}

export function useDeleteSuppression() {
  const activeTeamId = useActiveTeamId();
  const { canManageTeam } = useTeamPermissions();

  return useOptimisticListMutation<string, string, Suppression>({
    queryKey: queryKeys.suppressions.list(activeTeamId),
    mutationFn: async (id) => {
      assertPermission(
        canManageTeam,
        "Only admins and owners can remove suppressions.",
      );
      await apiMutate(
        `/suppressions/${encodeURIComponent(id)}`,
        "DELETE",
        suppressionDeletedSchema,
      );
      return id;
    },
    optimisticUpdate: (current, id) => current?.filter((s) => s.id !== id),
  });
}
