import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TeamCardHeader } from "./team-card-header";
import { TeamOverviewForm } from "./team-overview-form";

export function TeamOverview({
    initialName,
    initialAvatarUrl,
}: {
    initialName: string;
    initialAvatarUrl?: string;
}) {
    return (
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <TeamCardHeader
                icon={Building2}
                title="Team Overview"
                description="This name and avatar appear across Dugble's dashboard and in emails sent on your behalf."
            />
            <TeamOverviewForm
                initialName={initialName}
                initialAvatarUrl={initialAvatarUrl}
            />
        </Card>
    );
}
