// src/components/dashboard/nav-panel.tsx

import type { DashboardPortal } from "./dashboard-nav";
import { LogoutButton } from "./logout-button";
import { NavGroupList } from "./nav-group-list";

export function NavPanel({ portal }: { portal: DashboardPortal }) {
  return (
    <div className="hidden h-full w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r bg-sidebar px-3 py-4 lg:flex">
      <p className="px-2 font-heading text-sm font-semibold tracking-tight">
        {portal.label}
      </p>
      <NavGroupList groups={portal.groups} />
      {portal.id === "account" && (
        <div className="mt-auto border-t pt-3">
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
