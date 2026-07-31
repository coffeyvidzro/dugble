"use client";

import { usePathname } from "next/navigation";

import { Menu } from "lucide-react";

import { SearchTrigger } from "@/components/command-palette/search-trigger";
import { ThemeToggle } from "@/components/theme-toggle";
import { findNavTitle } from "./dashboard-nav";

export function DashboardHeader({
  onOpenMobileNav,
}: {
  onOpenMobileNav?: () => void;
}) {
  const pathname = usePathname();
  const title = findNavTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/75 sm:h-16 sm:gap-3 sm:px-4 lg:px-8">
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <p className="truncate font-heading text-sm font-medium">{title}</p>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <SearchTrigger className="hidden sm:inline-flex" />
        <ThemeToggle />
      </div>
    </header>
  );
}
