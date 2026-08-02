import { ArrowDownLeft, ArrowUpRight, Download } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    formatCurrency,
    formatDateTime,
    type TransactionStatus,
    type WalletTransaction,
} from "./types";

const STATUS_STYLE: Record<TransactionStatus, string> = {
    completed: "border-signal/30 bg-signal/10 text-signal",
    pending: "border-pending/30 bg-pending/10 text-pending",
    failed: "border-danger/30 bg-danger/10 text-danger",
};

const STATUS_LABEL: Record<TransactionStatus, string> = {
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
};

function downloadReceipt(transaction: WalletTransaction) {
    const blob = new Blob(
        [
            `Dugble receipt\n`,
            `Reference: ${transaction.reference}\n`,
            `Description: ${transaction.description}\n`,
            `Amount: ${formatCurrency(transaction.amountCents)}\n`,
            `Status: ${STATUS_LABEL[transaction.status]}\n`,
            `Date: ${formatDateTime(transaction.occurredAt)}\n`,
        ],
        { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dugble-receipt-${transaction.reference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
}

export function TransactionRow({
    transaction,
}: {
    transaction: WalletTransaction;
}) {
    const isCredit = transaction.amountCents > 0;

    return (
        <TableRow className="group border-b-0 transition-colors hover:bg-muted/30">
            <TableCell className="border-l-2 border-l-transparent transition-colors group-hover:border-l-signal/50">
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
                        <p className="truncate font-medium">
                            {transaction.description}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                            {transaction.reference}
                        </p>
                    </div>
                </div>
            </TableCell>
            <TableCell
                className="text-sm text-muted-foreground"
                title={transaction.occurredAt.toLocaleString()}
            >
                {formatDateTime(transaction.occurredAt)}
            </TableCell>
            <TableCell>
                <Badge
                    variant="outline"
                    className={cn(
                        "shadow-none",
                        STATUS_STYLE[transaction.status],
                    )}
                >
                    {STATUS_LABEL[transaction.status]}
                </Badge>
            </TableCell>
            <TableCell
                className={cn(
                    "text-right font-mono text-sm font-medium",
                    isCredit ? "text-signal" : "text-foreground",
                )}
            >
                {isCredit ? "+" : "-"}
                {formatCurrency(Math.abs(transaction.amountCents))}
            </TableCell>
            <TableCell className="text-right">
                {transaction.status === "completed" && (
                    <button
                        type="button"
                        onClick={() => downloadReceipt(transaction)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        aria-label="Download receipt"
                    >
                        <Download className="size-4" />
                    </button>
                )}
            </TableCell>
        </TableRow>
    );
}
