"use client";

import { useMemo, useState } from "react";

import { Receipt, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TransactionRow } from "./transaction-row";
import type { WalletTransaction } from "./types";

type FilterValue = "all" | "top_up" | "usage";

const FILTERS: { value: FilterValue; label: string }[] = [
    { value: "all", label: "All" },
    { value: "top_up", label: "Top-ups" },
    { value: "usage", label: "Usage" },
];

export function TransactionsPanel({
    transactions,
}: {
    transactions: WalletTransaction[];
}) {
    const [filter, setFilter] = useState<FilterValue>("all");
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        return transactions.filter((t) => {
            if (filter !== "all" && t.type !== filter) return false;
            const q = query.trim().toLowerCase();
            if (!q) return true;
            return (
                t.description.toLowerCase().includes(q) ||
                t.reference.toLowerCase().includes(q)
            );
        });
    }, [transactions, filter, query]);

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-muted/5 px-6 py-3">
                <div className="flex flex-wrap items-center gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.value}
                            type="button"
                            onClick={() => setFilter(f.value)}
                            className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                filter === f.value
                                    ? "border-primary/40 bg-primary/10 text-primary"
                                    : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40",
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search transactions"
                        className="h-8 w-40 border-border bg-muted/20 pl-8 text-sm text-foreground shadow-sm focus-visible:border-primary focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-52"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                        <Receipt className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        No transactions found
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Top up your wallet to see transactions appear here.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/40 hover:bg-transparent">
                                <TableHead className="w-80">
                                    Description
                                </TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Amount
                                </TableHead>
                                <TableHead className="w-10 text-right" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((txn) => (
                                <TransactionRow
                                    key={txn.id}
                                    transaction={txn}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    );
}
