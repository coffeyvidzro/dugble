"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { SessionUser } from "@/lib/session";
import { PortalRail } from "./portal-rail";
import { MobileNav } from "./mobile-nav";
import { NavPanel } from "./nav-panel";
import {
    dashboardPortals,
    findPortalForPath,
    type DashboardPortal,
} from "./dashboard-nav";

export function AppSidebar({
    user,
    mobileNavOpen,
    onMobileNavOpenChange,
}: {
    user: SessionUser;
    mobileNavOpen: boolean;
    onMobileNavOpenChange: (open: boolean) => void;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [activePortalId, setActivePortalId] = useState<string | null>(
        () => findPortalForPath(pathname)?.id ?? null,
    );

    // Keeps the rail in sync when navigation happens.
    useEffect(() => {
        const matched = findPortalForPath(pathname);
        if (matched) setActivePortalId(matched.id);
    }, [pathname]);

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
                    activePortalId={activePortalId}
                    onSelectPortal={selectPortal}
                    user={user}
                />
                {activePortal && <NavPanel portal={activePortal} />}
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
