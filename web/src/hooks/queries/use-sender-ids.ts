// src/hooks/queries/use-sender-ids.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type CreateSenderIdInput,
  createSenderIdInputSchema,
  senderIdListSchema,
  senderIdSchema,
} from "@/types/sender-id";

export function useSenderIds() {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.senderIds.list(teamId),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet("/sender-ids", senderIdListSchema, { signal, teamId }),
    staleTime: 30_000,
  });
}

export function useSenderId(senderId: string) {
  return useQuery({
    queryKey: queryKeys.senderIds.detail(senderId),
    queryFn: ({ signal }) =>
      apiGet(`/sender-ids/${encodeURIComponent(senderId)}`, senderIdSchema, {
        signal,
      }),
    enabled: Boolean(senderId),
  });
}

export function useCreateSenderId() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSenderIdInput) =>
      apiMutate(
        "/sender-ids",
        "POST",
        senderIdSchema,
        createSenderIdInputSchema.parse(input),
      ),
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.senderIds.detail(created.id), created);
      queryClient.invalidateQueries({
        queryKey: queryKeys.senderIds.lists(),
      });
    },
  });
}

export function useDeleteSenderId() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (senderId: string) =>
      apiMutate(
        `/sender-ids/${encodeURIComponent(senderId)}`,
        "DELETE",
        senderIdSchema,
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.senderIds.detail(updated.id), updated);
      queryClient.invalidateQueries({
        queryKey: queryKeys.senderIds.lists(),
      });
    },
  });
}
