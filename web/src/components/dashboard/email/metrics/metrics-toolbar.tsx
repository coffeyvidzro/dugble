import { EmailFilterSelect } from "../emails-page/email-filter-select";
import { RefreshButton } from "../emails-page/refresh-button";
import {
    METRICS_RANGE_OPTIONS,
    METRICS_RANGE_SHORT_LABEL,
    type MetricsDomainFilter,
    type MetricsRange,
} from "./types";

const DOMAIN_FILTER_OPTIONS: { value: MetricsDomainFilter; label: string }[] = [
    { value: "all", label: "All domains" },
    { value: "notify.dugble.com", label: "notify.dugble.com" },
    { value: "receipts.dugble.com", label: "receipts.dugble.com" },
    { value: "updates.kessie.dev", label: "updates.kessie.dev" },
];

export function MetricsToolbar({
    domainFilter,
    onDomainFilterChange,
    range,
    onRangeChange,
    refreshing,
    onRefresh,
}: {
    domainFilter: MetricsDomainFilter;
    onDomainFilterChange: (value: MetricsDomainFilter) => void;
    range: MetricsRange;
    onRangeChange: (value: MetricsRange) => void;
    refreshing: boolean;
    onRefresh: () => void;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
                Showing metrics for the last{" "}
                <span className="font-medium text-foreground">
                    {METRICS_RANGE_SHORT_LABEL[range]}
                </span>
                .
            </p>
            <div className="flex items-center gap-2">
                <EmailFilterSelect
                    label="Domain"
                    value={domainFilter}
                    onChange={onDomainFilterChange}
                    options={DOMAIN_FILTER_OPTIONS}
                />
                <EmailFilterSelect
                    label="Range"
                    value={range}
                    onChange={onRangeChange}
                    options={METRICS_RANGE_OPTIONS}
                />
                <RefreshButton refreshing={refreshing} onRefresh={onRefresh} />
            </div>
        </div>
    );
}
