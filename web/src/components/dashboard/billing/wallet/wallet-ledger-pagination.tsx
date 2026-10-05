// src/components/dashboard/billing/wallet/wallet-ledger-pagination.tsx

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * GET /wallet/ledger has no total-count field — pagination here is "does
 * another page exist" (a full page came back), same pattern as SMS
 * History and the Emails list.
 */
export function WalletLedgerPagination({
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
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-2"
        >
          <ChevronLeft className="size-3.5" />
        </Button>
        <span className="font-mono text-xs text-muted-foreground">
          Page {page}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-2"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
