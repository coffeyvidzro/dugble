import Link from "next/link";

import { Plus } from "lucide-react";

import { BroadcastSearchInput } from "./broadcast-search-input";
import { BroadcastStatusFilterDropdown } from "./broadcast-status-filter-dropdown";
import type { BroadcastStatus } from "./types";

export function BroadcastsToolbar({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
}: {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: BroadcastStatus | "all";
    onStatusFilterChange: (value: BroadcastStatus | "all") => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/5 px-6 py-3">
            <div className="flex flex-wrap items-center gap-2">
                <BroadcastSearchInput
                    value={search}
                    onChange={onSearchChange}
                />
                <BroadcastStatusFilterDropdown
                    value={statusFilter}
                    onChange={onStatusFilterChange}
                />
            </div>
            <Link
                href="/dashboard/email/broadcasts/new"
                className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
            >
                <Plus className="size-4" />
                New broadcast
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
            </Link>
        </div>
    );
}
