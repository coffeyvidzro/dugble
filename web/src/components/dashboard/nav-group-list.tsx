"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { type DashboardNavGroup, findNavMatch } from "./dashboard-nav";

export function NavGroupList({
  groups,
  onNavigate,
}: {
  groups: DashboardNavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeHref = findNavMatch(pathname)?.item.href;

  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className="space-y-0.5">
          <p className="px-2 pb-1 font-mono text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
            {group.label}
          </p>
          {group.items.map((item) => {
            const isActive = item.href === activeHref;
            const isExternal = !item.href.startsWith("/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-8.5 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors",
                  isActive
                    ? "bg-muted font-medium text-foreground shadow-[inset_2px_0_0_var(--signal)]"
                    : "text-foreground/75 hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn("size-4 shrink-0", isActive && "text-signal")}
                />
                <span className="flex-1 truncate">{item.title}</span>
                {isExternal && (
                  <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}
