import { Download, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TransactionTypeFilterSelect } from "./transaction-type-filter-select";
import { TransactionStatusFilterSelect } from "./transaction-status-filter-select";
import {
    downloadTransactionsCsv,
    type Transaction,
    type TransactionStatus,
    type TransactionType,
} from "./types";

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
        <div className="flex flex-col gap-3 border-b border-border/40 bg-muted/5 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search description or reference"
                        className="w-full rounded-lg border border-border/60 bg-muted/20 py-2 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                    />
                    {search.length > 0 && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            aria-label="Clear search"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
                <TransactionTypeFilterSelect
                    value={typeFilter}
                    onChange={onTypeFilterChange}
                />
                <TransactionStatusFilterSelect
                    value={statusFilter}
                    onChange={onStatusFilterChange}
                />
            </div>
            <Button
                type="button"
                onClick={() => downloadTransactionsCsv(exportTransactions)}
                disabled={exportTransactions.length === 0}
                className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
            >
                <Download className="size-3.5" />
                Export CSV
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                />
            </Button>
        </div>
    );
}
