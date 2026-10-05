// src/hooks/queries/use-broadcasts-api.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { keepPreviousTeamData } from "@/lib/api/team-placeholder";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type BroadcastListParams,
  type BroadcastPreviewInput,
  broadcastAnalyticsSchema,
  broadcastExclusionSummarySchema,
  broadcastListSchema,
  broadcastPreviewInputSchema,
  broadcastPreviewSchema,
  broadcastRecipientListSchema,
  broadcastSchema,
  type CreateBroadcastInput,
  createBroadcastInputSchema,
  type DuplicateBroadcastInput,
  duplicateBroadcastInputSchema,
  type SendBroadcastInput,
  sendBroadcastInputSchema,
  type UpdateBroadcastInput,
  updateBroadcastInputSchema,
} from "@/types/broadcast-api";

function buildListQuery(params: BroadcastListParams): string {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  return qs ? `/broadcasts?${qs}` : "/broadcasts";
}

export function useBroadcastsApi(params: BroadcastListParams = { limit: 50 }) {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.broadcastsApi.list(teamId, params),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet(buildListQuery(params), broadcastListSchema, { signal, teamId }),
    placeholderData: keepPreviousTeamData(teamId),
    staleTime: 15_000,
  });
}

export function useBroadcastApi(broadcastId: string) {
  return useQuery({
    queryKey: queryKeys.broadcastsApi.detail(broadcastId),
    queryFn: ({ signal }) =>
      apiGet(
        `/broadcasts/${encodeURIComponent(broadcastId)}`,
        broadcastSchema,
        { signal },
      ),
    enabled: Boolean(broadcastId),
  });
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBroadcastInput) =>
      apiMutate(
        "/broadcasts",
        "POST",
        broadcastSchema,
        createBroadcastInputSchema.parse(input),
      ),
    onSuccess: (broadcast) => {
      queryClient.setQueryData(
        queryKeys.broadcastsApi.detail(broadcast.id),
        broadcast,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.broadcastsApi.lists(),
      });
    },
  });
}

export function useUpdateBroadcast(broadcastId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBroadcastInput) =>
      apiMutate(
        `/broadcasts/${encodeURIComponent(broadcastId)}`,
        "PATCH",
        broadcastSchema,
        updateBroadcastInputSchema.parse(input),
      ),
    onSuccess: (broadcast) => {
      queryClient.setQueryData(
        queryKeys.broadcastsApi.detail(broadcastId),
        broadcast,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.broadcastsApi.lists(),
      });
    },
  });
}

export function useDeleteBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (broadcastId: string) =>
      apiMutate(
        `/broadcasts/${encodeURIComponent(broadcastId)}`,
        "DELETE",
        broadcastSchema,
      ),
    onSuccess: (_data, broadcastId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.broadcastsApi.detail(broadcastId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.broadcastsApi.lists(),
      });
    },
  });
}

export function useSendBroadcast(broadcastId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendBroadcastInput = {}) =>
      apiMutate(
        `/broadcasts/${encodeURIComponent(broadcastId)}/send`,
        "POST",
        broadcastSchema,
        sendBroadcastInputSchema.parse(input),
      ),
    onSuccess: (broadcast) => {
      queryClient.setQueryData(
        queryKeys.broadcastsApi.detail(broadcastId),
        broadcast,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.broadcastsApi.lists(),
      });
    },
  });
}

export function useCancelBroadcast(broadcastId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate(
        `/broadcasts/${encodeURIComponent(broadcastId)}/cancel`,
        "POST",
        broadcastSchema,
      ),
    onSuccess: (broadcast) => {
      queryClient.setQueryData(
        queryKeys.broadcastsApi.detail(broadcastId),
        broadcast,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.broadcastsApi.lists(),
      });
    },
  });
}

export function useDuplicateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      broadcastId,
      input = {},
    }: {
      broadcastId: string;
      input?: DuplicateBroadcastInput;
    }) =>
      apiMutate(
        `/broadcasts/${encodeURIComponent(broadcastId)}/duplicate`,
        "POST",
        broadcastSchema,
        duplicateBroadcastInputSchema.parse(input),
      ),
    onSuccess: (broadcast) => {
      queryClient.setQueryData(
        queryKeys.broadcastsApi.detail(broadcast.id),
        broadcast,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.broadcastsApi.lists(),
      });
    },
  });
}

export function usePreviewBroadcast(broadcastId: string) {
  return useMutation({
    mutationFn: (input: BroadcastPreviewInput = {}) =>
      apiMutate(
        `/broadcasts/${encodeURIComponent(broadcastId)}/preview`,
        "POST",
        broadcastPreviewSchema,
        broadcastPreviewInputSchema.parse(input),
      ),
  });
}

export function useBroadcastRecipients(broadcastId: string) {
  return useQuery({
    queryKey: queryKeys.broadcastsApi.recipients(broadcastId),
    queryFn: ({ signal }) =>
      apiGet(
        `/broadcasts/${encodeURIComponent(broadcastId)}/recipients`,
        broadcastRecipientListSchema,
        { signal },
      ),
    enabled: Boolean(broadcastId),
  });
}

export function useBroadcastExclusions(broadcastId: string) {
  return useQuery({
    queryKey: queryKeys.broadcastsApi.exclusions(broadcastId),
    queryFn: ({ signal }) =>
      apiGet(
        `/broadcasts/${encodeURIComponent(broadcastId)}/exclusions`,
        broadcastExclusionSummarySchema,
        { signal },
      ),
    enabled: Boolean(broadcastId),
  });
}

export function useBroadcastAnalytics(broadcastId: string) {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.broadcastsApi.analytics(broadcastId),
    queryFn: ({ signal }) =>
      apiGet(
        `/broadcasts/${encodeURIComponent(broadcastId)}/analytics`,
        broadcastAnalyticsSchema,
        { signal, teamId },
      ),
    enabled: Boolean(teamId) && Boolean(broadcastId),
  });
}
