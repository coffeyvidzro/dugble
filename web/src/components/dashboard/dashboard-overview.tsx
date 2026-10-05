// src/components/dashboard/dashboard-overview.tsx

import { requireSession } from "@/lib/session";
import { DashboardOverviewClient } from "./dashboard-overview-client";

export async function DashboardOverview() {
  const session = await requireSession();
  const displayName = session.user.name.trim() || session.user.email;

  return <DashboardOverviewClient displayName={displayName} />;
}
