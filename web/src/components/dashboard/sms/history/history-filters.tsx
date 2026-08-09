import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import { HistorySearchInput } from "./history-search-input";
import { HistorySenderFilterSelect } from "./history-sender-filter-select";
import {
    HISTORY_DATE_LABEL,
    HISTORY_STATUS_LABEL,
    type HistoryDateFilter,
    type HistoryStatusFilter,
} from "./types";

const STATUS_FILTERS: HistoryStatusFilter[] = [
    "all",
    "queued",
    "sent",
    "delivered",
    "clicked",
    "failed",
    "undelivered",
];

const DATE_FILTERS: HistoryDateFilter[] = ["24h", "7d", "30d", "90d", "all"];

export function HistoryFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
    dateRange,
    onDateRangeChange,
    sender,
    onSenderChange,
    senderOptions,
}: {
    search: string;
    onSearchChange: (value: string) => void;
    status: HistoryStatusFilter;
    onStatusChange: (status: HistoryStatusFilter) => void;
    dateRange: HistoryDateFilter;
    onDateRangeChange: (range: HistoryDateFilter) => void;
    sender: string;
    onSenderChange: (sender: string) => void;
    senderOptions: string[];
}) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <HistorySearchInput value={search} onChange={onSearchChange} />
                <div className="flex flex-wrap items-center gap-2">
                    <HistorySenderFilterSelect
                        value={sender}
                        onChange={onSenderChange}
                        options={senderOptions}
                    />
                    <div className="overflow-x-auto">
                        <DashboardRangeSelector
                            ranges={DATE_FILTERS}
                            labels={HISTORY_DATE_LABEL}
                            value={dateRange}
                            onChange={onDateRangeChange}
                        />
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <DashboardRangeSelector
                    ranges={STATUS_FILTERS}
                    labels={HISTORY_STATUS_LABEL}
                    value={status}
                    onChange={onStatusChange}
                />
            </div>
        </div>
    );
}
