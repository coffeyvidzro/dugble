"use client";

import { useMemo, useState } from "react";

import { ArrowLeftRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TransactionDetailSheet } from "./transaction-detail-sheet";
import { TransactionRow } from "./transaction-row";
import { TransactionsPagination } from "./transactions-pagination";
import { TransactionsTableHeader } from "./transactions-table-header";
import { TransactionsToolbar } from "./transactions-toolbar";
import type { Transaction, TransactionStatus, TransactionType } from "./types";

const PAGE_SIZE = 8;

export function TransactionsTableCard({
    transactions,
    refreshing,
    onRefresh,
}: {
    transactions: Transaction[];
    refreshing: boolean;
    onRefresh: () => void;
}) {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<TransactionType | "all">(
        "all",
    );
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
        "all",
    );
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Transaction | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return transactions.filter((t) => {
            if (typeFilter !== "all" && t.type !== typeFilter) return false;
            if (statusFilter !== "all" && t.status !== statusFilter)
                return false;
            if (!q) return true;
            return (
                t.description.toLowerCase().includes(q) ||
                t.reference.toLowerCase().includes(q)
            );
        });
    }, [transactions, search, typeFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paged = filtered.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
    );

    function handleSearchChange(value: string) {
        setSearch(value);
        setPage(1);
    }

    function handleTypeFilterChange(value: TransactionType | "all") {
        setTypeFilter(value);
        setPage(1);
    }

    function handleStatusFilterChange(value: TransactionStatus | "all") {
        setStatusFilter(value);
        setPage(1);
    }

    return (
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <TransactionsTableHeader
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
            <TransactionsToolbar
                search={search}
                onSearchChange={handleSearchChange}
                typeFilter={typeFilter}
                onTypeFilterChange={handleTypeFilterChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                exportTransactions={filtered}
            />

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                        <ArrowLeftRight className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        No transactions found
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Try a different search term or clear your filters.
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border/40 hover:bg-transparent">
                                    <TableHead className="w-72">
                                        Transaction
                                    </TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Amount
                                    </TableHead>
                                    <TableHead className="w-10 text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paged.map((txn) => (
                                    <TransactionRow
                                        key={txn.id}
                                        transaction={txn}
                                        onView={setSelected}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <TransactionsPagination
                        page={safePage}
                        totalPages={totalPages}
                        totalCount={filtered.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </>
            )}

            <TransactionDetailSheet
                transaction={selected}
                onOpenChange={(open) => !open && setSelected(null)}
            />
        </Card>
    );
}
