"use client";

import { useTeamMembers } from "@/hooks/queries/use-team-members";
import { useCurrentUser } from "@/hooks/queries/use-user";
import { useActiveTeamId } from "@/store/active-team-store";

export function useTeamPermissions() {
  const activeTeamId = useActiveTeamId();
  const { data: user } = useCurrentUser();

  const { data: members, isLoading: isMembersLoading } = useTeamMembers(
    activeTeamId ?? "",
  );

  // Find the current user's role in this specific team
  const currentMember = members?.find((m) => m.user_id === user?.id);
  const role = currentMember?.role ?? null;

  return {
    role,
    isOwner: role === "owner",
    isAdmin: role === "admin",
    isMember: role === "member",

    canManageTeam: role === "owner" || role === "admin",
    isLoading: isMembersLoading || !user,
  };
}
