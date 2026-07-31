"use client";

import { useState, type ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import type { SessionUser } from "@/lib/session";

export function DashboardShell({
  children,
  user,
}: {
  children: ReactNode;
  user: SessionUser;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <AppSidebar
        user={user}
        mobileNavOpen={mobileNavOpen}
        onMobileNavOpenChange={setMobileNavOpen}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 animate-fade-up sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
