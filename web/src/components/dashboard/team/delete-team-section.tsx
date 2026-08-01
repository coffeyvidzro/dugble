import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TeamCardHeader } from "./team-card-header";
import { DeleteTeamDialog } from "./delete-team-dialog";

export function DeleteTeamSection({ teamName }: { teamName: string }) {
    return (
        <Card className="border-danger/30 bg-danger/5 shadow-sm transition-colors hover:border-danger/50">
            <TeamCardHeader
                icon={AlertTriangle}
                title="Danger Zone"
                description="Permanently delete this workspace and everything in it including API keys, webhooks, delivery workflows, and historical logs."
                danger
            />
            <CardContent>
                <DeleteTeamDialog teamName={teamName} />
            </CardContent>
        </Card>
    );
}
