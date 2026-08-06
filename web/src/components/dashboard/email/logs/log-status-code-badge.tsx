import { cn } from "@/lib/utils";
import { STATUS_CODE_META, type LogStatusCode } from "./types";

export function LogStatusCodeBadge({ code }: { code: LogStatusCode }) {
    const meta = STATUS_CODE_META[code];
    const isSuccess = meta.statusClass === "success";

    return (
        <span
            title={meta.description}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-xs font-medium",
                isSuccess
                    ? "border-signal/30 bg-signal/10 text-signal"
                    : "border-danger/30 bg-danger/10 text-danger",
            )}
        >
            {code}
        </span>
    );
}
