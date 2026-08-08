"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { HistoryFilters } from "./history-filters";
import { HistoryTable } from "./history-table";
import { HistoryPagination } from "./history-pagination";
import { ExportHistoryCsvButton } from "./export-history-csv-button";
import { getMockMessagePool, SENDER_NUMBERS } from "../sms-dashboard/types";
import {
    HISTORY_PAGE_SIZE,
    matchesHistoryFilters,
    paginate,
    type HistoryDateFilter,
    type HistoryStatusFilter,
} from "./types";

export function HistoryOverview() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<HistoryStatusFilter>("all");
    const [dateRange, setDateRange] = useState<HistoryDateFilter>("30d");
    const [sender, setSender] = useState("all");
    const [page, setPage] = useState(1);

    const allMessages = useMemo(() => getMockMessagePool(), []);
    const senderOptions = useMemo(
        () =>
            SENDER_NUMBERS.filter((s) => s.status === "approved").map(
                (s) => s.number,
            ),
        [],
    );

    const filtered = useMemo(
        () =>
            allMessages.filter((message) =>
                matchesHistoryFilters(message, {
                    search,
                    status,
                    dateRange,
                    sender,
                }),
            ),
        [allMessages, search, status, dateRange, sender],
    );

    // Any filter change invalidates the current page
    useEffect(() => {
        setPage(1);
    }, [search, status, dateRange, sender]);

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / HISTORY_PAGE_SIZE),
    );
    const pageItems = useMemo(
        () => paginate(filtered, page, HISTORY_PAGE_SIZE),
        [filtered, page],
    );

    return (
        <Card className="border-border/40 shadow-sm animate-fade-up">
            <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-xl">Message history</CardTitle>
                    <CardDescription>
                        {filtered.length.toLocaleString()} of{" "}
                        {allMessages.length.toLocaleString()} messages
                    </CardDescription>
                </div>
                <ExportHistoryCsvButton messages={filtered} />
            </CardHeader>

            <div className="border-b border-border/40 p-4">
                <HistoryFilters
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    sender={sender}
                    onSenderChange={setSender}
                    senderOptions={senderOptions}
                />
            </div>

            <HistoryTable messages={pageItems} />

            <HistoryPagination
                page={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                pageSize={HISTORY_PAGE_SIZE}
                onPageChange={setPage}
            />
        </Card>
    );
}
