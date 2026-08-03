import {
    ArrowDownLeft,
    ArrowUpRight,
    CreditCard,
    Eye,
    Landmark,
    QrCode,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
    formatCurrency,
    formatDateTime,
    formatDateTimeFull,
    TRANSACTION_METHOD_LABEL,
    TRANSACTION_TYPE_LABEL,
    type Transaction,
    type TransactionMethod,
    type TransactionStatus,
    type TransactionType,
} from "./types";

const TYPE_STYLE: Record<TransactionType, string> = {
    top_up: "border-signal/30 bg-signal/10 text-signal",
    usage: "border-border/50 bg-muted/30 text-muted-foreground",
    refund: "border-primary/30 bg-primary/10 text-primary",
    adjustment: "border-pending/30 bg-pending/10 text-pending",
};

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

const METHOD_ICON: Record<TransactionMethod, typeof CreditCard> = {
    card: CreditCard,
    bank_transfer: Landmark,
    usdt: QrCode,
};

export function TransactionRow({
    transaction,
    onView,
}: {
    transaction: Transaction;
    onView: (transaction: Transaction) => void;
}) {
    const isCredit = transaction.amountCents > 0;
    const MethodIcon = transaction.method
        ? METHOD_ICON[transaction.method]
        : null;

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
            <TableCell>
                <Badge
                    variant="outline"
                    className={cn("shadow-none", TYPE_STYLE[transaction.type])}
                >
                    {TRANSACTION_TYPE_LABEL[transaction.type]}
                </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
                {MethodIcon && transaction.method ? (
                    <span className="flex items-center gap-1.5">
                        <MethodIcon className="size-3.5" />
                        {TRANSACTION_METHOD_LABEL[transaction.method]}
                    </span>
                ) : (
                    "—"
                )}
            </TableCell>
            <TableCell
                className="text-sm text-muted-foreground"
                title={formatDateTimeFull(transaction.occurredAt)}
                suppressHydrationWarning
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
                <button
                    type="button"
                    onClick={() => onView(transaction)}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="View transaction details"
                >
                    <Eye className="size-4" />
                </button>
            </TableCell>
        </TableRow>
    );
}
