// src/components/dashboard/team/delete-team-section.tsx

"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamPermissions } from "@/hooks/queries/use-team-permissions";
import { DeleteTeamDialog } from "./delete-team-dialog";
import { TeamCardHeader } from "./team-card-header";

export function DeleteTeamSection({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const { isOwner } = useTeamPermissions();

  // Completely block the Danger Zone from rendering for admins and basic members
  if (!isOwner) {
    return null;
  }

  return (
    <Card className="border-danger/30 bg-danger/5 shadow-sm transition-colors hover:border-danger/50">
      <TeamCardHeader
        icon={AlertTriangle}
        title="Danger Zone"
        description="Permanently delete this team and everything in it including API keys, webhooks, delivery workflows, and historical logs."
        danger
      />
      <CardContent>
        <DeleteTeamDialog teamId={teamId} teamName={teamName} />
      </CardContent>
    </Card>
  );
}
