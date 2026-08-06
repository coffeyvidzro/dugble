"use client";

import { useMemo, useState } from "react";
import { LogsHeader } from "./logs-header";
import { LogsStats } from "./logs-stats";
import { LogsToolbar } from "./logs-toolbar";
import { LogTable } from "./log-table";
import { LogCardsList } from "./log-cards-list";
import { LogsEmptyState } from "./logs-empty-state";
import { LogsPagination } from "./logs-pagination";
import {
    LOGS,
    filterLogsByRange,
    matchesStatusFilter,
    type LogRange,
    type LogStatusFilterValue,
} from "./types";

const PAGE_SIZE = 10;

export function LogsOverview() {
    const [search, setSearch] = useState("");
    const [range, setRange] = useState<LogRange>("7d");
    const [statusFilter, setStatusFilter] =
        useState<LogStatusFilterValue>("all");
    const [page, setPage] = useState(1);

    const overallSuccessRate = useMemo(() => {
        if (LOGS.length === 0) return 100;
        const successCount = LOGS.filter((log) => log.statusCode < 400).length;
        return (successCount / LOGS.length) * 100;
    }, []);

    const rangeFilteredLogs = useMemo(
        () => filterLogsByRange(LOGS, range),
        [range],
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();

        return rangeFilteredLogs.filter((log) => {
            const matchesQuery =
                query.length === 0 ||
                log.to.toLowerCase().includes(query) ||
                log.subject.toLowerCase().includes(query) ||
                log.requestId.toLowerCase().includes(query);

            return matchesQuery && matchesStatusFilter(log, statusFilter);
        });
    }, [rangeFilteredLogs, search, statusFilter]);

    const hasActiveFilters = search.trim().length > 0 || statusFilter !== "all";
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    function applyFilterChange(update: () => void) {
        update();
        setPage(1);
    }

    function resetFilters() {
        applyFilterChange(() => {
            setSearch("");
            setStatusFilter("all");
        });
    }

    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <LogsHeader successRatePct={overallSuccessRate} />

            <div className="space-y-6">
                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "100ms",
                        animationFillMode: "both",
                    }}
                >
                    <LogsStats logs={rangeFilteredLogs} />
                </div>

                <div
                    className="animate-fade-up"
                    style={{
                        animationDelay: "150ms",
                        animationFillMode: "both",
                    }}
                >
                    <LogsToolbar
                        search={search}
                        onSearchChange={(value) =>
                            applyFilterChange(() => setSearch(value))
                        }
                        range={range}
                        onRangeChange={(value) =>
                            applyFilterChange(() => setRange(value))
                        }
                        statusFilter={statusFilter}
                        onStatusFilterChange={(value) =>
                            applyFilterChange(() => setStatusFilter(value))
                        }
                    />
                </div>

                <div
                    className="animate-fade-up space-y-4"
                    style={{
                        animationDelay: "200ms",
                        animationFillMode: "both",
                    }}
                >
                    {filtered.length === 0 ? (
                        <LogsEmptyState
                            variant={
                                hasActiveFilters ? "no-results" : "no-logs"
                            }
                            onClearFilters={resetFilters}
                        />
                    ) : (
                        <>
                            <LogTable logs={paginated} />
                            <LogCardsList logs={paginated} />
                            <LogsPagination
                                page={currentPage}
                                totalPages={totalPages}
                                totalCount={filtered.length}
                                pageSize={PAGE_SIZE}
                                onPageChange={setPage}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
