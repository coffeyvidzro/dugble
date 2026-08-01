import { Building2 } from "lucide-react";

import { SectionCardHeader } from "./section-card-header";
import { UserTeamsPanel } from "./user-teams-panel";
import { Card } from "@/components/ui/card";
import type { UserTeam } from "./types";

export function UserTeamsCard({
    teams,
    onLeaveTeam,
    onDeleteTeam,
}: {
    teams: UserTeam[];
    onLeaveTeam: (id: string) => void;
    onDeleteTeam: (id: string) => void;
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={Building2}
                title="Teams"
                description="Workspaces associated with your account."
            />
            <UserTeamsPanel
                teams={teams}
                onLeaveTeam={onLeaveTeam}
                onDeleteTeam={onDeleteTeam}
            />
        </Card>
    );
}
