import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TeamCardHeader } from "./team-card-header";
import { TeamOverviewForm } from "./team-overview-form";

export function TeamOverview({ teamId }: { teamId: string }) {
  return (
    <Card className="overflow-hidden">
      <TeamCardHeader
        icon={Building2}
        title="Team Overview"
        description="This name appears across Dugble's dashboard and in emails sent on your behalf."
      />
      <TeamOverviewForm teamId={teamId} />
    </Card>
  );
}
