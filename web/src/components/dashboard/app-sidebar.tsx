"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/session";
import {
  type DashboardPortal,
  dashboardPortals,
  findPortalForPath,
} from "./dashboard-nav";
import { MobileNav } from "./mobile-nav";
import { NavPanel } from "./nav-panel";
import { PortalRail } from "./portal-rail";

export function AppSidebar({
  user,
  mobileNavOpen,
  onMobileNavOpenChange,
  panelCollapsed,
}: {
  user: SessionUser;
  mobileNavOpen: boolean;
  onMobileNavOpenChange: (open: boolean) => void;
  panelCollapsed: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/dashboard";
  const [activePortalId, setActivePortalId] = useState<string | null>(
    () => findPortalForPath(pathname)?.id ?? null,
  );

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    const matched = findPortalForPath(pathname);
    if (matched) setActivePortalId(matched.id);
    else if (pathname === "/dashboard") setActivePortalId(null);
  }

  const activePortal: DashboardPortal | null =
    dashboardPortals.find((p) => p.id === activePortalId) ?? null;

  function selectPortal(portal: DashboardPortal) {
    setActivePortalId(portal.id);
    const firstItem = portal.groups[0]?.items[0];
    if (firstItem) router.push(firstItem.href);
  }

  return (
    <>
      <div className="flex h-full shrink-0">
        <PortalRail
          portals={dashboardPortals}
          activePortalId={isHome ? null : activePortalId}
          isHome={isHome}
          onSelectPortal={selectPortal}
          user={user}
        />
        {activePortal && !panelCollapsed && <NavPanel portal={activePortal} />}
      </div>

      <MobileNav
        user={user}
        open={mobileNavOpen}
        onOpenChange={onMobileNavOpenChange}
        activePortal={activePortal}
      />
    </>
  );
}
