import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmailFilterSelect } from "./email-filter-select";
import {
    DATE_FILTER_OPTIONS,
    DIRECTION_FILTER_OPTIONS,
    STATUS_FILTER_OPTIONS,
    type DateFilter,
    type DirectionFilter,
    type StatusFilter,
} from "./types";

export function EmailsToolbar({
    query,
    onQueryChange,
    statusFilter,
    onStatusFilterChange,
    directionFilter,
    onDirectionFilterChange,
    dateFilter,
    onDateFilterChange,
}: {
    query: string;
    onQueryChange: (value: string) => void;
    statusFilter: StatusFilter;
    onStatusFilterChange: (value: StatusFilter) => void;
    directionFilter: DirectionFilter;
    onDirectionFilterChange: (value: DirectionFilter) => void;
    dateFilter: DateFilter;
    onDateFilterChange: (value: DateFilter) => void;
}) {
    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 border-b border-border/40 bg-muted/5 px-6 py-3">
            <div className="relative w-full sm:w-64 md:w-80">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search by recipient or subject"
                    className="h-8 w-full border-foreground/15 bg-background pl-8 text-sm"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <EmailFilterSelect
                    label="Status"
                    value={statusFilter}
                    onChange={onStatusFilterChange}
                    options={STATUS_FILTER_OPTIONS}
                />
                <EmailFilterSelect
                    label="Direction"
                    value={directionFilter}
                    onChange={onDirectionFilterChange}
                    options={DIRECTION_FILTER_OPTIONS}
                />
                <EmailFilterSelect
                    label="Date"
                    value={dateFilter}
                    onChange={onDateFilterChange}
                    options={DATE_FILTER_OPTIONS}
                />
            </div>
        </div>
    );
}
