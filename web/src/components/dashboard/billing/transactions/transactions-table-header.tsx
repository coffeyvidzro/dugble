import { ArrowLeftRight, RefreshCw } from "lucide-react";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TransactionsTableHeader({
    refreshing,
    onRefresh,
}: {
    refreshing: boolean;
    onRefresh: () => void;
}) {
    return (
        <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-border/40 bg-muted/10 pb-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
                    <ArrowLeftRight className="size-4" />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-xl">All Transactions</CardTitle>
                    <CardDescription>
                        Top-ups, usage debits, refunds, and adjustments.
                    </CardDescription>
                </div>
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
                className="shrink-0"
            >
                <RefreshCw
                    className={cn(
                        "mr-1.5 size-3.5",
                        refreshing && "animate-spin",
                    )}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
        </CardHeader>
    );
}
