"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { DashboardNavGroup } from "./dashboard-nav";
import { cn } from "@/lib/utils";

export function NavGroupList({
  groups,
  onNavigate,
}: {
  groups: DashboardNavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-muted font-medium text-signal"
                      : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
