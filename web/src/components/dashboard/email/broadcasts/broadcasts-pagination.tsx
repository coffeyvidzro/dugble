import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BroadcastsPagination({
    page,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}) {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalCount);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 bg-muted/5 px-6 py-3">
            <p className="font-mono text-xs text-muted-foreground">
                Showing {start}-{end} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="h-8 px-2"
                >
                    <ChevronLeft className="size-3.5" />
                </Button>
                <span className="font-mono text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="h-8 px-2"
                >
                    <ChevronRight className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}
