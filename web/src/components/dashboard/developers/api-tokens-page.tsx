"use client";

import { PageHeader } from "@/components/dashboard/portal-hero-header";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { TeamTokensClient } from "@/components/dashboard/team/team-tokens-client";
import { Card } from "@/components/ui/card";

export function ApiTokensPage() {
  return (
    <div className="mx-auto w-full max-w-7xl pb-8">
      <PageHeader
        title="API tokens"
        description="Tokens for team administration and automation, scoped by permission. Only team owners and admins can manage them."
      />
      <RequireActiveTeam description="Create or select a team to manage its API tokens.">
        <Card className="gap-0 py-0">
          <TeamTokensClient />
        </Card>
      </RequireActiveTeam>
    </div>
  );
}
