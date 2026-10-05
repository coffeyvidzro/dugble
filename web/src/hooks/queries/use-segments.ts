"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptimisticListMutation } from "@/hooks/mutations/use-optimistic-list-mutation";
import { assertPermission } from "@/lib/api/assert-permission";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  audienceSizeSchema,
  type CreateSegmentInput,
  createSegmentInputSchema,
  type Segment,
  segmentDeletedSchema,
  segmentSchema,
  segmentsListSchema,
} from "@/types/segment";
import { useTeamPermissions } from "./use-team-permissions";

export function useSegments() {
  const activeTeamId = useActiveTeamId();

  return useQuery({
    queryKey: queryKeys.segments.list(activeTeamId),
    queryFn: ({ signal }) =>
      apiGet("/segments", segmentsListSchema, { signal, teamId: activeTeamId }),
    enabled: Boolean(activeTeamId),
    staleTime: 30_000,
  });
}

export function useSegment(id: string) {
  return useQuery({
    queryKey: queryKeys.segments.detail(id),
    queryFn: ({ signal }) =>
      apiGet(`/segments/${encodeURIComponent(id)}`, segmentSchema, { signal }),
    enabled: Boolean(id),
  });
}

export function useSegmentAudienceSize(id: string | null) {
  return useQuery({
    queryKey: queryKeys.segments.audienceSize(id ?? ""),
    queryFn: ({ signal }) =>
      apiGet(
        `/segments/${encodeURIComponent(id ?? "")}/audience-size`,
        audienceSizeSchema,
        {
          signal,
        },
      ),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useCreateSegment() {
  const activeTeamId = useActiveTeamId();
  const { canManageTeam } = useTeamPermissions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSegmentInput) => {
      assertPermission(
        canManageTeam,
        "Only admins and owners can create segments.",
      );
      return apiMutate(
        "/segments",
        "POST",
        segmentSchema,
        createSegmentInputSchema.parse(input),
      );
    },
    onSuccess: (created) => {
      queryClient.setQueryData<Segment[]>(
        queryKeys.segments.list(activeTeamId),
        (current) => (current ? [created, ...current] : [created]),
      );
    },
  });
}

export function useDeleteSegment() {
  const activeTeamId = useActiveTeamId();
  const { canManageTeam } = useTeamPermissions();

  return useOptimisticListMutation<string, string, Segment>({
    queryKey: queryKeys.segments.list(activeTeamId),
    mutationFn: async (id) => {
      assertPermission(
        canManageTeam,
        "Only admins and owners can delete segments.",
      );
      await apiMutate(
        `/segments/${encodeURIComponent(id)}`,
        "DELETE",
        segmentDeletedSchema,
      );
      return id;
    },
    optimisticUpdate: (current, id) => current?.filter((s) => s.id !== id),
  });
}
