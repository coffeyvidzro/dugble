"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { SessionUser } from "@/lib/session";

const PANEL_COLLAPSED_KEY = "dugble.nav-panel-collapsed";

/** UI-only preference: whether the secondary nav panel is collapsed. */
function usePanelCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(PANEL_COLLAPSED_KEY) === "1");
    } catch {
      // Storage unavailable (private mode); keep the default.
    }
  }, []);

  function update(next: boolean) {
    setCollapsed(next);
    try {
      window.localStorage.setItem(PANEL_COLLAPSED_KEY, next ? "1" : "0");
    } catch {
      // Ignore: the preference just won't persist.
    }
  }

  return [collapsed, update] as const;
}

export function DashboardShell({
  children,
  user,
}: {
  children: ReactNode;
  user: SessionUser;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = usePanelCollapsed();

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <AppSidebar
        user={user}
        mobileNavOpen={mobileNavOpen}
        onMobileNavOpenChange={setMobileNavOpen}
        panelCollapsed={panelCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          onOpenMobileNav={() => setMobileNavOpen(true)}
          panelCollapsed={panelCollapsed}
          onTogglePanel={() => setPanelCollapsed(!panelCollapsed)}
        />
        <main className="flex flex-1 animate-fade-up flex-col gap-6 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
