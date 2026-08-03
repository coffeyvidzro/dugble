"use client";

import { useMemo, useState } from "react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { EmailsHeader } from "./emails-header";
import { EmailsTable } from "./emails-table";
import { EmailsToolbar } from "./emails-toolbar";
import { RefreshButton } from "./refresh-button";
import { SendEmailDialog, type SendEmailInput } from "./send-email-dialog";
import {
    DATE_FILTER_MS,
    EMAILS_PAGE_SIZE,
    generateEmailLog,
    randomMessageId,
    SEND_FROM_ADDRESSES,
    type DateFilter,
    type DirectionFilter,
    type EmailLogEntry,
    type StatusFilter,
} from "./types";

const INITIAL_LOG_SEED = 42;
const REFRESH_POOL_SEED = 7;

export function EmailsLogView() {
    const [allEmails, setAllEmails] = useState<EmailLogEntry[]>(() =>
        generateEmailLog(50, INITIAL_LOG_SEED),
    );
    const [refreshPool, setRefreshPool] = useState<EmailLogEntry[]>(() =>
        generateEmailLog(6, REFRESH_POOL_SEED, 10),
    );
    const [refreshing, setRefreshing] = useState(false);

    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [directionFilter, setDirectionFilter] =
        useState<DirectionFilter>("all");
    const [dateFilter, setDateFilter] = useState<DateFilter>("all");
    const [page, setPage] = useState(1);

    const hasActiveFilters =
        query.trim() !== "" ||
        statusFilter !== "all" ||
        directionFilter !== "all" ||
        dateFilter !== "all";

    function handleQueryChange(value: string) {
        setQuery(value);
        setPage(1);
    }
    function handleStatusFilterChange(value: StatusFilter) {
        setStatusFilter(value);
        setPage(1);
    }
    function handleDirectionFilterChange(value: DirectionFilter) {
        setDirectionFilter(value);
        setPage(1);
    }
    function handleDateFilterChange(value: DateFilter) {
        setDateFilter(value);
        setPage(1);
    }

    const filteredEmails = useMemo(() => {
        const q = query.trim().toLowerCase();
        return allEmails.filter((email) => {
            if (statusFilter !== "all" && email.status !== statusFilter) {
                return false;
            }
            if (
                directionFilter !== "all" &&
                email.direction !== directionFilter
            ) {
                return false;
            }
            if (dateFilter !== "all") {
                const cutoffMs = DATE_FILTER_MS[dateFilter];
                if (Date.now() - email.sentAt.getTime() > cutoffMs) {
                    return false;
                }
            }
            if (q) {
                const matches =
                    email.to.toLowerCase().includes(q) ||
                    email.from.toLowerCase().includes(q) ||
                    email.subject.toLowerCase().includes(q);
                if (!matches) return false;
            }
            return true;
        });
    }, [allEmails, statusFilter, directionFilter, dateFilter, query]);

    const totalItems = filteredEmails.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / EMAILS_PAGE_SIZE));
    const clampedPage = Math.min(page, totalPages);

    const pagedEmails = useMemo(() => {
        const start = (clampedPage - 1) * EMAILS_PAGE_SIZE;
        return filteredEmails.slice(start, start + EMAILS_PAGE_SIZE);
    }, [filteredEmails, clampedPage]);

    function handleRefresh() {
        if (refreshing) return;
        setRefreshing(true);
        window.setTimeout(() => {
            if (refreshPool.length > 0) {
                const [next, ...rest] = refreshPool;
                setAllEmails((prev) => [next, ...prev]);
                setRefreshPool(rest);
            }
            setRefreshing(false);
        }, 700);
    }

    function simulateDelivery(id: string) {
        window.setTimeout(
            () => {
                setAllEmails((prev) =>
                    prev.map((e) =>
                        e.id === id ? { ...e, status: "delivered" } : e,
                    ),
                );
            },
            2000 + Math.random() * 1500,
        );
    }

    function handleSendEmail(input: SendEmailInput) {
        const now = Date.now();
        const newEntries: EmailLogEntry[] = input.to.map(
            (recipient, index) => ({
                id: `sent-${now}-${index}`,
                messageId: randomMessageId(),
                to: recipient,
                from: input.from,
                subject: input.subject,
                status: "sent",
                direction: "sent",
                sentAt: new Date(now),
            }),
        );

        setAllEmails((prev) => [...newEntries, ...prev]);
        setPage(1);
        newEntries.forEach((entry) => simulateDelivery(entry.id));
    }

    function handleResend(email: EmailLogEntry) {
        setAllEmails((prev) =>
            prev.map((e) => (e.id === email.id ? { ...e, status: "sent" } : e)),
        );
        simulateDelivery(email.id);
    }

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <EmailsHeader totalCount={allEmails.length} />

            <div
                className="animate-fade-up"
                style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
                <Card className="border-border/40 shadow-sm">
                    <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border/40 bg-muted/10 pb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Email Log</CardTitle>
                            <CardDescription>
                                Search, filter, and send transactional emails.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <RefreshButton
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                            />
                            <SendEmailDialog
                                fromAddresses={SEND_FROM_ADDRESSES}
                                onSend={handleSendEmail}
                            />
                        </div>
                    </CardHeader>

                    <EmailsToolbar
                        query={query}
                        onQueryChange={handleQueryChange}
                        statusFilter={statusFilter}
                        onStatusFilterChange={handleStatusFilterChange}
                        directionFilter={directionFilter}
                        onDirectionFilterChange={handleDirectionFilterChange}
                        dateFilter={dateFilter}
                        onDateFilterChange={handleDateFilterChange}
                    />

                    <EmailsTable
                        emails={pagedEmails}
                        page={clampedPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={EMAILS_PAGE_SIZE}
                        onPageChange={setPage}
                        onResend={handleResend}
                        hasActiveFilters={hasActiveFilters}
                    />
                </Card>
            </div>
        </div>
    );
}
