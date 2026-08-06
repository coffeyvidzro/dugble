"use client";

import { useTeamMembers } from "./team-members-context";
import { PortalHeroHeader } from "../portal-hero-header";

export function TeamHeader({ teamName }: { teamName: string }) {
    const { activeCount } = useTeamMembers();

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
                    {activeCount} active{" "}
                    {activeCount === 1 ? "member" : "members"}
                </>
            }
        />
    );
}
