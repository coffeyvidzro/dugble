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
                onClick={onRefresh}
                disabled={refreshing}
                className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
            >
                <RefreshCw
                    className={cn("size-4", refreshing && "animate-spin")}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
            </Button>
        </CardHeader>
    );
}
