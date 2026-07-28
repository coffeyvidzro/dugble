"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchTrigger } from "@/components/command-palette/search-trigger";
import { ThemeToggle } from "@/components/theme-toggle";
import { findNavTitle } from "./dashboard-nav";

export function DashboardHeader() {
    const pathname = usePathname();
    const title = findNavTitle(pathname);

    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/75 lg:px-8">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <p className="truncate font-heading text-sm font-medium">{title}</p>

            <div className="ml-auto flex items-center gap-2">
                <SearchTrigger className="hidden sm:inline-flex" />
                <ThemeToggle />
            </div>
        </header>
    );
}
