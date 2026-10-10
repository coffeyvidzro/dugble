import { Plus } from "lucide-react";
import Link from "next/link";
import type { BroadcastStatus } from "@/types/broadcast-api";
import { BroadcastSearchInput } from "./broadcast-search-input";
import { BroadcastStatusFilterDropdown } from "./broadcast-status-filter-dropdown";

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
        <BroadcastSearchInput value={search} onChange={onSearchChange} />
        <BroadcastStatusFilterDropdown
          value={statusFilter}
          onChange={onStatusFilterChange}
        />
      </div>
      <Link
        href="/dashboard/email/broadcasts/new"
        className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
      >
        <Plus className="size-4" />
        New broadcast
      </Link>
    </div>
  );
}
