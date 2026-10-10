import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionCardHeader } from "./section-card-header";
import { UserTeamsPanel } from "./user-teams-panel";

export function UserTeamsCard() {
  return (
    <Card>
      <SectionCardHeader
        icon={Building2}
        title="Teams"
        description="Workspaces associated with your account."
      />
      <UserTeamsPanel />
    </Card>
  );
}
