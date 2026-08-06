"use client";

import { useMemo, useState } from "react";

import { ArrowDown, ArrowUp, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { BroadcastDetailDialog } from "./broadcast-detail-dialog";
import { BroadcastRow } from "./broadcast-row";
import { BroadcastsPagination } from "./broadcasts-pagination";
import { BroadcastsToolbar } from "./broadcasts-toolbar";
import { ConfirmDialog } from "./confirm-dialog";
import type { Broadcast, BroadcastStatus } from "./types";

const PAGE_SIZE = 8;

function getSortDate(broadcast: Broadcast): number {
    return (
        broadcast.sentAt ??
        broadcast.scheduledAt ??
        broadcast.createdAt
    ).getTime();
}

export function BroadcastsTableCard({
    broadcasts,
    onDuplicate,
    onDelete,
}: {
    broadcasts: Broadcast[];
    onDuplicate: (broadcast: Broadcast) => void;
    onDelete: (id: string) => void;
}) {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<BroadcastStatus | "all">(
        "all",
    );
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [viewing, setViewing] = useState<Broadcast | null>(null);
    const [deleting, setDeleting] = useState<Broadcast | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return broadcasts.filter((b) => {
            if (statusFilter !== "all" && b.status !== statusFilter)
                return false;
            if (!q) return true;
            return b.subject.toLowerCase().includes(q);
        });
    }, [broadcasts, search, statusFilter]);

    const sorted = useMemo(() => {
        const list = [...filtered];
        list.sort((a, b) =>
            sortDirection === "desc"
                ? getSortDate(b) - getSortDate(a)
                : getSortDate(a) - getSortDate(b),
        );
        return list;
    }, [filtered, sortDirection]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paged = sorted.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
    );

    function handleSearchChange(value: string) {
        setSearch(value);
        setPage(1);
    }

    function handleStatusFilterChange(value: BroadcastStatus | "all") {
        setStatusFilter(value);
        setPage(1);
    }

    function handleEdit(broadcast: Broadcast) {
        router.push(`/dashboard/email/broadcasts/new?id=${broadcast.id}`);
    }

    return (
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-xl">All Broadcasts</CardTitle>
                <CardDescription>
                    Every newsletter, announcement, and campaign sent,
                    scheduled, or drafted.
                </CardDescription>
            </CardHeader>
            <BroadcastsToolbar
                search={search}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
            />

            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50 border border-dashed border-border">
                        <Megaphone className="size-5 text-muted-foreground" />
                    </div>
                    <h3 className="mb-1 font-heading text-lg font-medium">
                        No broadcasts found
                    </h3>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Try a different search term, clear your filters, or
                        create your first broadcast.
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-border/40 hover:bg-transparent">
                                    <TableHead className="w-64">
                                        Broadcast
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Recipients
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Opens
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Clicks
                                    </TableHead>
                                    <TableHead>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSortDirection((d) =>
                                                    d === "desc"
                                                        ? "asc"
                                                        : "desc",
                                                )
                                            }
                                            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                                        >
                                            Date
                                            {sortDirection === "desc" ? (
                                                <ArrowDown className="size-3" />
                                            ) : (
                                                <ArrowUp className="size-3" />
                                            )}
                                        </button>
                                    </TableHead>
                                    <TableHead className="w-10 text-right" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paged.map((broadcast) => (
                                    <BroadcastRow
                                        key={broadcast.id}
                                        broadcast={broadcast}
                                        onView={setViewing}
                                        onEdit={handleEdit}
                                        onDuplicate={onDuplicate}
                                        onRequestDelete={setDeleting}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <BroadcastsPagination
                        page={safePage}
                        totalPages={totalPages}
                        totalCount={sorted.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </>
            )}

            <BroadcastDetailDialog
                broadcast={viewing}
                onOpenChange={(open) => !open && setViewing(null)}
            />

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title={
                    <>
                        Delete &ldquo;{deleting?.subject || "this broadcast"}
                        &rdquo;?
                    </>
                }
                description="This can't be undone. Sent broadcasts keep their delivery history even if deleted from this list."
                confirmLabel="Delete broadcast"
                onConfirm={() => {
                    if (!deleting) return;
                    onDelete(deleting.id);
                    setDeleting(null);
                }}
            />
        </Card>
    );
}
