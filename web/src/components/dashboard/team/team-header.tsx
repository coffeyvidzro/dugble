// src/components/dashboard/team/team-header.tsx

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
      breadcrumb="Settings / Team"
      title={teamName}
      description="Manage members, roles, and the management tokens that script this workspace."
      badge={
        <>
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-signal" />
          </span>
          {activeCount ?? 0} active {activeCount === 1 ? "member" : "members"}
        </>
      }
    />
  );
}
