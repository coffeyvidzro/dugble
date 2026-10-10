"use client";

import { useActiveMemberCount } from "@/hooks/queries/use-team-members";
import { PortalHeroHeader } from "../portal-hero-header";

export function TeamHeader({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const { data: activeCount } = useActiveMemberCount(teamId);

  return (
    <PortalHeroHeader
      title={teamName}
      description="Manage members, roles, and the management tokens that script this workspace."
      badge={
        <>
          {activeCount ?? 0} active {activeCount === 1 ? "member" : "members"}
        </>
      }
    />
  );
}
