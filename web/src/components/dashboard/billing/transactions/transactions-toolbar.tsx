import { Download, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    downloadTransactionsCsv,
    type Transaction,
    type TransactionStatus,
    type TransactionType,
} from "./types";

const TYPE_FILTERS: { value: TransactionType | "all"; label: string }[] = [
    { value: "all", label: "All types" },
    { value: "top_up", label: "Top-ups" },
    { value: "usage", label: "Usage" },
    { value: "refund", label: "Refunds" },
    { value: "adjustment", label: "Adjustments" },
];

const STATUS_FILTERS: { value: TransactionStatus | "all"; label: string }[] = [
    { value: "all", label: "All statuses" },
    { value: "completed", label: "Completed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
];

export function TransactionsToolbar({
    search,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    statusFilter,
    onStatusFilterChange,
    exportTransactions,
}: {
    search: string;
    onSearchChange: (value: string) => void;
    typeFilter: TransactionType | "all";
    onTypeFilterChange: (value: TransactionType | "all") => void;
    statusFilter: TransactionStatus | "all";
    onStatusFilterChange: (value: TransactionStatus | "all") => void;
    exportTransactions: Transaction[];
}) {
    return (
        <div className="space-y-3 border-b border-border/40 bg-muted/5 px-6 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search description or reference"
                        className="h-8 w-56 border-border bg-muted/20 pl-8 text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-64"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTransactionsCsv(exportTransactions)}
                    disabled={exportTransactions.length === 0}
                >
                    <Download className="mr-1.5 size-3.5" />
                    Export CSV
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {TYPE_FILTERS.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => onTypeFilterChange(filter.value)}
                        className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            typeFilter === filter.value
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40",
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
                <span
                    aria-hidden="true"
                    className="mx-1 h-4 w-px bg-border/60"
                />
                {STATUS_FILTERS.map((filter) => (
                    <button
                        key={filter.value}
                        type="button"
                        onClick={() => onStatusFilterChange(filter.value)}
                        className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            statusFilter === filter.value
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40",
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
