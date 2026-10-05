import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaginationControls({
  page,
  itemCount,
  hasNextPage,
  onPageChange,
}: {
  page: number;
  itemCount: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 bg-muted/5 px-6 py-3">
      <p className="text-xs text-muted-foreground">
        {itemCount === 0
          ? "0 results"
          : `Showing ${itemCount} result${itemCount === 1 ? "" : "s"}`}
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
          <ChevronLeft className="size-3.5" />
        </Button>
        <span className="px-2 text-xs font-medium text-muted-foreground">
          Page {page}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
