import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";

interface TableToolbarProps {
  totalCount: number;
  itemNameSingular: string;
  itemNamePlural: string;
  statusNode?: ReactNode;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  actionNode: ReactNode;
  hideSearchWhenEmpty?: boolean;
}

export function TableToolbar({
  totalCount,
  itemNameSingular,
  itemNamePlural,
  statusNode,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  actionNode,
  hideSearchWhenEmpty = false,
}: TableToolbarProps) {
  const showSearch = !hideSearchWhenEmpty || totalCount > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
      <p className="text-xs text-muted-foreground">
        {totalCount === 0
          ? `No ${itemNamePlural} yet`
          : `${totalCount} ${totalCount === 1 ? itemNameSingular : itemNamePlural}`}
        {statusNode}
      </p>
      <div className="flex items-center gap-2">
        {showSearch && (
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-[34px] w-64 max-w-sm pr-3 pl-8 text-[13px]"
            />
          </div>
        )}
        {actionNode}
      </div>
    </div>
  );
}
