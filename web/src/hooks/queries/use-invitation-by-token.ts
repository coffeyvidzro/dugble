"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { invitationWithTokenSchema } from "@/types/team";

export function useInvitationByToken(token: string) {
  return useQuery({
    queryKey: queryKeys.invitationByToken(token),
    queryFn: ({ signal }) =>
      apiGet(
        `/teams/invitations/${encodeURIComponent(token)}`,
        invitationWithTokenSchema,
        {
          signal,
        },
      ),
    enabled: Boolean(token),
    retry: false,
  });
}

function useRespondToInvitationByToken(action: "accept" | "decline") {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      apiMutate(
        `/teams/invitations/${encodeURIComponent(token)}/${encodeURIComponent(action)}`,
        "POST",
        invitationWithTokenSchema,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.myInvitations.list(),
      });
    },
  });
}

export function useAcceptInvitationByToken() {
  return useRespondToInvitationByToken("accept");
}

export function useDeclineInvitationByToken() {
  return useRespondToInvitationByToken("decline");
}
