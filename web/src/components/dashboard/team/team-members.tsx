import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TeamCardHeader } from "./team-card-header";
import { TeamMembersClient } from "./team-members-client";

export function TeamMembers() {
    return (
        <Card className="border-border/40 shadow-sm">
            <TeamCardHeader
                icon={Users}
                title="Members"
                description="Control who can view logs, configure webhooks, and change team settings."
            />
            <TeamMembersClient />
        </Card>
    );
}
