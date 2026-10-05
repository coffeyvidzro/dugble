"use client";

import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useOptimisticListMutation } from "@/hooks/mutations/use-optimistic-list-mutation";
import { assertPermission } from "@/lib/api/assert-permission";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId, useSetActiveTeamId } from "@/store/active-team-store";
import {
  type InvitableRole,
  invitationWithTokenSchema,
  inviteMemberInputSchema,
  leftResponseSchema,
  removedResponseSchema,
  revokedInvitationSchema,
  type TeamInvitation,
  type TeamMember,
  type TeamRole,
  teamInvitationsListSchema,
  teamMemberSchema,
  teamMembersListSchema,
  updateMemberRoleInputSchema,
} from "@/types/team";
import type { User } from "@/types/user";

function getTeamManagerContext(
  queryClient: QueryClient,
  teamId: string,
): { currentUser: User | undefined; isManager: boolean | null } {
  const currentUser = queryClient.getQueryData<User>(queryKeys.users.me());
  const members = queryClient.getQueryData<TeamMember[]>(
    queryKeys.teams.members(teamId),
  );

  if (!currentUser || !members) {
    return { currentUser, isManager: null };
  }

  const activeMember = members.find((m) => m.user_id === currentUser.id);
  const isManager =
    activeMember?.role === "admin" || activeMember?.role === "owner";

  return { currentUser, isManager };
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId),
    queryFn: ({ signal }) =>
      apiGet(
        `/teams/${encodeURIComponent(teamId)}/members`,
        teamMembersListSchema,
        { signal, teamId },
      ),
    enabled: Boolean(teamId),
  });
}

export function useActiveMemberCount(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teams.members(teamId),
    queryFn: ({ signal }) =>
      apiGet(
        `/teams/${encodeURIComponent(teamId)}/members`,
        teamMembersListSchema,
        { signal, teamId },
      ),
    enabled: Boolean(teamId),
    select: (members) => members.filter((m) => m.status === "active").length,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      email,
      role,
    }: {
      teamId: string;
      email: string;
      role: InvitableRole;
    }) => {
      const { isManager } = getTeamManagerContext(queryClient, teamId);
      assertPermission(
        isManager !== false,
        "Only admins and owners can invite new team members.",
      );

      return apiMutate(
        `/teams/${encodeURIComponent(teamId)}/members/invite`,
        "POST",
        invitationWithTokenSchema,
        inviteMemberInputSchema.parse({ email, role }),
        { teamId },
      );
    },
    onSuccess: (_invitation, { teamId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.invitations(teamId),
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teamId,
      userId,
      role,
    }: {
      teamId: string;
      userId: string;
      role: TeamRole;
    }) => {
      const { isManager } = getTeamManagerContext(queryClient, teamId);
      assertPermission(
        isManager !== false,
        "Only admins and owners can update team member roles.",
      );

      return apiMutate(
        `/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(userId)}`,
        "PATCH",
        teamMemberSchema,
        updateMemberRoleInputSchema.parse({ role }),
        { teamId },
      );
    },
    onSuccess: (updated, { teamId }) => {
      queryClient.setQueryData<TeamMember[]>(
        queryKeys.teams.members(teamId),
        (current) =>
          current?.map((m) => (m.user_id === updated.user_id ? updated : m)),
      );
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  const activeTeamId = useActiveTeamId();

  return useOptimisticListMutation<
    { teamId: string; userId: string },
    { removed: boolean },
    TeamMember
  >({
    queryKey: queryKeys.teams.members(activeTeamId ?? ""),
    mutationFn: async ({ teamId, userId }) => {
      const { currentUser, isManager } = getTeamManagerContext(
        queryClient,
        teamId,
      );
      assertPermission(
        isManager !== false || userId === currentUser?.id,
        "You do not have permission to remove other team members.",
      );

      return apiMutate(
        `/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(userId)}`,
        "DELETE",
        removedResponseSchema,
        undefined,
        { teamId },
      );
    },
    optimisticUpdate: (current, { userId }) =>
      current?.filter((m) => m.user_id !== userId),
  });
}

export function useLeaveTeam() {
  const queryClient = useQueryClient();
  const activeTeamId = useActiveTeamId();
  const setActiveTeamId = useSetActiveTeamId();

  return useMutation({
    mutationFn: (teamId: string) =>
      apiMutate(
        `/teams/${encodeURIComponent(teamId)}/members/leave`,
        "DELETE",
        leftResponseSchema,
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

export function useTeamInvitations(teamId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.teams.invitations(teamId),
    queryFn: ({ signal }) =>
      apiGet(
        `/teams/${encodeURIComponent(teamId)}/invitations`,
        teamInvitationsListSchema,
        { signal, teamId },
      ),
    enabled: Boolean(teamId) && enabled,
  });
}

export function useRevokeTeamInvitation() {
  const queryClient = useQueryClient();
  const activeTeamId = useActiveTeamId();

  return useOptimisticListMutation<
    { teamId: string; invitationId: string },
    TeamInvitation,
    TeamInvitation
  >({
    queryKey: queryKeys.teams.invitations(activeTeamId ?? ""),
    mutationFn: async ({ teamId, invitationId }) => {
      const { isManager } = getTeamManagerContext(queryClient, teamId);
      assertPermission(
        isManager !== false,
        "Only admins and owners can revoke invitations.",
      );

      return apiMutate(
        `/teams/${encodeURIComponent(teamId)}/invitations/${encodeURIComponent(invitationId)}`,
        "DELETE",
        revokedInvitationSchema,
        undefined,
        { teamId },
      );
    },
    optimisticUpdate: (current, { invitationId }) =>
      current?.filter((invite) => invite.id !== invitationId),
  });
}
