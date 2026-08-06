import { LogBroadStatusFilter } from "./log-broad-status-filter";
import { LogStatusCodeSelect } from "./log-status-code-select";
import type { LogStatusFilterValue } from "./types";

export function LogStatusFilter({
    value,
    onChange,
}: {
    value: LogStatusFilterValue;
    onChange: (value: LogStatusFilterValue) => void;
}) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <LogBroadStatusFilter value={value} onChange={onChange} />
            <LogStatusCodeSelect value={value} onChange={onChange} />
        </div>
    );
}
