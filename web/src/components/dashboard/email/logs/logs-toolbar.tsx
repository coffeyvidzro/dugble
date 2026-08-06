import { LogSearchInput } from "./log-search-input";
import { LogRangeSelector } from "./log-range-selector";
import { LogStatusFilter } from "./log-status-filter";
import type { LogRange, LogStatusFilterValue } from "./types";

interface LogsToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    range: LogRange;
    onRangeChange: (value: LogRange) => void;
    statusFilter: LogStatusFilterValue;
    onStatusFilterChange: (value: LogStatusFilterValue) => void;
}

export function LogsToolbar({
    search,
    onSearchChange,
    range,
    onRangeChange,
    statusFilter,
    onStatusFilterChange,
}: LogsToolbarProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <LogSearchInput value={search} onChange={onSearchChange} />
                <LogRangeSelector value={range} onChange={onRangeChange} />
            </div>
            <LogStatusFilter
                value={statusFilter}
                onChange={onStatusFilterChange}
            />
        </div>
    );
}
