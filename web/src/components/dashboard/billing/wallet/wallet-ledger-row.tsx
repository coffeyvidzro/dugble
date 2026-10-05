// src/components/dashboard/billing/wallet/wallet-ledger-row.tsx

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { WalletLedgerEntry } from "@/types/billing-api";
import { formatDateTime, formatMinorUnits } from "../shared/format";

function describeEntry(entry: WalletLedgerEntry): string {
  if (entry.subscription_charge_id) return "Subscription charge";
  if (entry.usage_authorization_id) return "Usage charge";
  return entry.transaction_type
    ? entry.transaction_type.charAt(0).toUpperCase() +
        entry.transaction_type.slice(1)
    : "Wallet entry";
}

export function WalletLedgerRow({
  entry,
  currency,
}: {
  entry: WalletLedgerEntry;
  currency: string;
}) {
  const isCredit = entry.amount_units > 0;

  return (
    <TableRow className="border-b border-border/40 last:border-0">
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg border",
              isCredit
                ? "border-signal/30 bg-signal/10 text-signal"
                : "border-border/50 bg-muted/30 text-muted-foreground",
            )}
          >
            {isCredit ? (
              <ArrowDownLeft className="size-4" />
            ) : (
              <ArrowUpRight className="size-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {describeEntry(entry)}
            </p>
            {entry.reference_id && (
              <p className="truncate font-mono text-xs text-muted-foreground">
                {entry.reference_id}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell
        className="text-sm text-muted-foreground"
        suppressHydrationWarning
      >
        {formatDateTime(entry.created_at)}
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-mono text-sm font-medium",
          isCredit ? "text-signal" : "text-foreground",
        )}
      >
        {isCredit ? "+" : "-"}
        {formatMinorUnits(Math.abs(entry.amount_units), currency)}
      </TableCell>
    </TableRow>
  );
}
