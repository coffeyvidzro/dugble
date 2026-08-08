import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HistoryPagination({
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}) {
    const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 px-4 py-3 text-sm text-muted-foreground">
            <span>
                {totalItems === 0
                    ? "0 results"
                    : `Showing ${start}–${end} of ${totalItems.toLocaleString()}`}
            </span>
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
                <span className="px-2 font-mono text-xs">
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
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
