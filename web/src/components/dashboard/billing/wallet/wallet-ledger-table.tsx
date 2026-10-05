import { Receipt } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WalletLedgerEntry } from "@/types/billing-api";
import { WalletLedgerPagination } from "./wallet-ledger-pagination";
import { WalletLedgerRow } from "./wallet-ledger-row";

export function WalletLedgerTable({
  entries,
  currency,
  page,
  hasNextPage,
  onPageChange,
}: {
  entries: WalletLedgerEntry[];
  currency: string;
  page: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
        <CardTitle className="text-xl">Wallet activity</CardTitle>
        <CardDescription>
          Every credit and debit against your wallet balance.
        </CardDescription>
      </CardHeader>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-dashed border-border bg-muted/50">
            <Receipt className="size-5 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-heading text-lg font-medium">
            No activity yet
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Top up your wallet to see activity appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <WalletLedgerRow
                    key={entry.id}
                    entry={entry}
                    currency={currency}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <WalletLedgerPagination
            page={page}
            itemCount={entries.length}
            hasNextPage={hasNextPage}
            onPageChange={onPageChange}
          />
        </>
      )}
    </Card>
  );
}
