// src/hooks/queries/use-my-invitations.ts

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptimisticListMutation } from "@/hooks/mutations/use-optimistic-list-mutation";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import {
  invitationActionResponseSchema,
  type MyInvitation,
  myInvitationsListSchema,
} from "@/types/team";

export function useMyInvitations() {
  return useQuery({
    queryKey: queryKeys.myInvitations.list(),
    queryFn: ({ signal }) =>
      apiGet("/users/me/invitations", myInvitationsListSchema, {
        signal,
      }),
    staleTime: 30_000,
  });
}

function useRespondToInvitation(action: "accept" | "decline") {
  const queryClient = useQueryClient();

  return useOptimisticListMutation<string, MyInvitation, MyInvitation>({
    queryKey: queryKeys.myInvitations.list(),
    mutationFn: (invitationId) =>
      apiMutate(
        `/users/me/invitations/${encodeURIComponent(invitationId)}/${encodeURIComponent(action)}`,
        "POST",
        invitationActionResponseSchema,
      ),
    optimisticUpdate: (current, invitationId) =>
      current?.filter((invite) => invite.id !== invitationId),
    reconcile: (current) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.lists(),
      });
      return current;
    },
  });
}

export function useAcceptInvitation() {
  return useRespondToInvitation("accept");
}

export function useDeclineInvitation() {
  return useRespondToInvitation("decline");
}
