"use client";

import { useState } from "react";

import { Check, Copy, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    formatCurrency,
    formatDateTime,
    TRANSACTION_METHOD_LABEL,
    TRANSACTION_TYPE_LABEL,
    type Transaction,
    type TransactionStatus,
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

function downloadReceipt(transaction: Transaction) {
    const blob = new Blob(
        [
            `Dugble receipt\n`,
            `Reference: ${transaction.reference}\n`,
            `Type: ${TRANSACTION_TYPE_LABEL[transaction.type]}\n`,
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

export function TransactionDetailDialog({
    transaction,
    onOpenChange,
}: {
    transaction: Transaction | null;
    onOpenChange: (open: boolean) => void;
}) {
    const [copied, setCopied] = useState(false);

    async function handleCopyReference() {
        if (!transaction) return;
        await navigator.clipboard.writeText(transaction.reference);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    }

    const isCredit = (transaction?.amountCents ?? 0) > 0;

    return (
        <Dialog
            open={transaction !== null}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) setCopied(false);
            }}
        >
            <DialogContent className="sm:max-w-sm border-border/40 shadow-xl">
                {transaction && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Transaction details</DialogTitle>
                            <DialogDescription>
                                {transaction.description}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="text-center">
                                <p
                                    className={cn(
                                        "font-heading text-3xl font-semibold tracking-tight",
                                        isCredit
                                            ? "text-signal"
                                            : "text-foreground",
                                    )}
                                >
                                    {isCredit ? "+" : "-"}
                                    {formatCurrency(
                                        Math.abs(transaction.amountCents),
                                    )}
                                </p>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "mt-2 shadow-none",
                                        STATUS_STYLE[transaction.status],
                                    )}
                                >
                                    {STATUS_LABEL[transaction.status]}
                                </Badge>
                            </div>

                            <div className="space-y-2 rounded-lg border border-border/50 bg-muted/10 p-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Type
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {
                                            TRANSACTION_TYPE_LABEL[
                                                transaction.type
                                            ]
                                        }
                                    </span>
                                </div>
                                {transaction.method && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Method
                                        </span>
                                        <span className="font-medium text-foreground">
                                            {
                                                TRANSACTION_METHOD_LABEL[
                                                    transaction.method
                                                ]
                                            }
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">
                                        Date
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {formatDateTime(transaction.occurredAt)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        Reference
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyReference}
                                        className="flex items-center gap-1.5 font-mono text-xs text-foreground transition-colors hover:text-primary"
                                    >
                                        {transaction.reference}
                                        {copied ? (
                                            <Check className="size-3.5 text-signal" />
                                        ) : (
                                            <Copy className="size-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="border-t border-border/40 pt-4">
                            {transaction.status === "completed" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => downloadReceipt(transaction)}
                                >
                                    <Download className="mr-2 size-4" />
                                    Download receipt
                                </Button>
                            )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
