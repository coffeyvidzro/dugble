import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Dashboard | Dugble",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
