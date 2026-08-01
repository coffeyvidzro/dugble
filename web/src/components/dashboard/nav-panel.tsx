"use client";

import type { DashboardPortal } from "./dashboard-nav";
import { NavGroupList } from "./nav-group-list";

export function NavPanel({ portal }: { portal: DashboardPortal }) {
  return (
    <div className="hidden h-full w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r bg-sidebar px-3 py-4 lg:flex">
      <p className="px-2 font-heading text-sm font-semibold tracking-tight">
        {portal.label}
      </p>
      <NavGroupList groups={portal.groups} />
    </div>
  );
}
