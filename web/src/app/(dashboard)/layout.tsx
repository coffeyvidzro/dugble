import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RootDocument } from "@/components/layout/root-document";
import { getQueryClient } from "@/config/query-client";
import { resolveActiveTeam } from "@/lib/active-team.server";
import { TEAM_SWITCHER_PARAMS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/query-keys";
import { getCspNonce } from "@/lib/security/nonce.server";
import { requireSession } from "@/lib/session";
import { ActiveTeamStoreProvider } from "@/store/active-team-store";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Dashboard",
  description:
    "Private Dugble workspace dashboard for managing A2P email, SMS, API keys, billing, and settings.",
  path: "/dashboard",
  preset: "dashboard",
});

export default async function Layout({ children }: { children: ReactNode }) {
  const [session, nonce] = await Promise.all([requireSession(), getCspNonce()]);
  const { teamId, teams } = await resolveActiveTeam();

  const queryClient = getQueryClient();
  if (teams) {
    queryClient.setQueryData(queryKeys.teams.list(TEAM_SWITCHER_PARAMS), teams);
  }

  return (
    <RootDocument nonce={nonce}>
      <ActiveTeamStoreProvider initialTeamId={teamId}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DashboardShell user={session.user}>{children}</DashboardShell>
        </HydrationBoundary>
      </ActiveTeamStoreProvider>
    </RootDocument>
  );
}
