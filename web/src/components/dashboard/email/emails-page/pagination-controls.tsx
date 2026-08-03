import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaginationControls({
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
    const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 bg-muted/5 px-6 py-3">
            <p className="text-xs text-muted-foreground">
                Showing {startItem}–{endItem} of {totalItems}
            </p>
            <div className="flex items-center gap-1.5">
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="size-4" />
                </Button>
                <span className="px-2 text-xs font-medium text-muted-foreground">
                    Page {page} of {totalPages}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    aria-label="Next page"
                >
                    <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}
