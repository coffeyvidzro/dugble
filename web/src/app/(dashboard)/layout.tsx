import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/session";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Dashboard",
  description:
    "Private Dugble workspace dashboard for managing A2P email, SMS, API keys, billing, and settings.",
  path: "/dashboard",
  preset: "dashboard",
});

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
