// src/components/dashboard/sms/history/history-pagination.tsx

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The API's list endpoint doesn't return a total count, so pagination here
 * is "does another page exist" (a full page came back) rather than a known
 * total-pages figure.
 */
export function HistoryPagination({
  page,
  pageSize,
  itemCount,
  hasNextPage,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  itemCount: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}) {
  const start = itemCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = (page - 1) * pageSize + itemCount;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 px-4 py-3 text-sm text-muted-foreground">
      <span>{itemCount === 0 ? "0 results" : `Showing ${start}–${end}`}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted/60",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="px-2 font-mono text-xs">Page {page}</span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          aria-label="Next page"
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted/60",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
