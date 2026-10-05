import { EmailFilterSelect } from "../emails-page/email-filter-select";
import { RefreshButton } from "../emails-page/refresh-button";
import {
  METRICS_RANGE_OPTIONS,
  METRICS_RANGE_SHORT_LABEL,
  type MetricsRange,
} from "./types";

export function MetricsToolbar({
  range,
  onRangeChange,
  refreshing,
  onRefresh,
}: {
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
