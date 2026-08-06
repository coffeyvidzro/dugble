import { PortalHeroHeader } from "../portal-hero-header";
import { Building2 } from "lucide-react";

export function ProfileHeader({
    name,
    teamCount,
}: {
    name: string;
    teamCount: number;
}) {
    return (
        <PortalHeroHeader
            breadcrumb="Settings / Profile"
            title={name}
            description="Manage your email, teams, and account security."
            badge={
                <>
                    <Building2 className="size-3.5" />
                    {teamCount} {teamCount === 1 ? "team" : "teams"}
                </>
            }
        />
    );
}
