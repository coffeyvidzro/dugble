import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/dashboard/shared/data-states";
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
    <Card className="gap-0 py-0">
      <CardHeader className="gap-1 border-b py-4">
        <CardTitle>Activity</CardTitle>
        <CardDescription>
          Every credit and debit against your wallet balance, newest first.
        </CardDescription>
      </CardHeader>

      {entries.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No activity yet"
          description="Top up your wallet to see credits and debits appear here."
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
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
