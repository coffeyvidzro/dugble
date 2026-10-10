"use client";

import { BookOpen, Menu, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { SearchTrigger } from "@/components/command-palette/search-trigger";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTeams } from "@/hooks/queries/use-teams";
import { TEAM_SWITCHER_PARAMS } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";
import { useActiveTeamId } from "@/store/active-team-store";
import { findNavMatch, nestedSegmentLabel } from "./dashboard-nav";

type Crumb = { id: string; label: string; href?: string };

function useBreadcrumbs(pathname: string): Crumb[] {
  // Same query key the team switcher uses; hydrated by the layout.
  const { data: teamData } = useTeams(TEAM_SWITCHER_PARAMS);
  const activeTeamId = useActiveTeamId();
  const teams = teamData?.items ?? [];
  const team = teams.find((t) => t.id === activeTeamId) ?? teams[0];

  const crumbs: Crumb[] = [];
  if (team) crumbs.push({ id: "team", label: team.name, href: "/dashboard" });

  if (pathname === "/dashboard") {
    crumbs.push({ id: "page", label: "Overview" });
    return crumbs;
  }

  const match = findNavMatch(pathname);
  if (!match) {
    crumbs.push({ id: "page", label: "Dashboard" });
    return crumbs;
  }

  const portalHome = match.portal.groups[0]?.items[0]?.href;
  crumbs.push({
    id: "portal",
    label: match.portal.shortLabel,
    href: portalHome,
  });
  if (match.isNested) {
    crumbs.push({ id: "item", label: match.item.title, href: match.item.href });
    crumbs.push({
      id: "nested",
      label: nestedSegmentLabel(pathname, match.item.href),
    });
  } else {
    crumbs.push({ id: "item", label: match.item.title });
  }
  return crumbs;
}

export function DashboardHeader({
  onOpenMobileNav,
  panelCollapsed,
  onTogglePanel,
}: {
  onOpenMobileNav?: () => void;
  panelCollapsed?: boolean;
  onTogglePanel?: () => void;
}) {
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname);
  const hasPanel = findNavMatch(pathname) !== null;

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/75 sm:gap-3 sm:px-4 lg:px-8">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {hasPanel && onTogglePanel && (
        <button
          type="button"
          onClick={onTogglePanel}
          aria-label={
            panelCollapsed ? "Show navigation panel" : "Hide navigation panel"
          }
          aria-pressed={!panelCollapsed}
          className="-ml-2 hidden size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
        >
          <PanelLeft className="size-4" />
        </button>
      )}

      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex min-w-0 items-center gap-2 text-[13px] text-muted-foreground">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <Fragment key={crumb.id}>
                {index > 0 && (
                  <li aria-hidden className="text-muted-foreground/50">
                    /
                  </li>
                )}
                <li
                  className={cn(
                    "truncate",
                    // On small screens keep only the last two crumbs.
                    index < crumbs.length - 2 && "hidden sm:block",
                  )}
                >
                  {isLast || !crumb.href ? (
                    <span
                      aria-current={isLast ? "page" : undefined}
                      className={cn(isLast && "font-medium text-foreground")}
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <SearchTrigger variant="field" className="hidden md:inline-flex" />
        <SearchTrigger className="hidden sm:inline-flex md:hidden" />
        <Link
          href="/docs"
          className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
        >
          <BookOpen className="size-3.5" />
          Docs
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
