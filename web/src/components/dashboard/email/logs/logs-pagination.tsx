"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface LogsPaginationProps {
    page: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export function LogsPagination({
    page,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
}: LogsPaginationProps) {
    const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalCount);

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/40 pt-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
                Showing {start}-{end} of {totalCount.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    aria-label="Previous page"
                    className="inline-flex size-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <span className="min-w-16 text-center text-xs font-medium text-foreground">
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                    className="inline-flex size-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    );
}
