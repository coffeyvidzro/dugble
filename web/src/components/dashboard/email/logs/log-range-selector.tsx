"use client";

import { cn } from "@/lib/utils";
import { LOG_RANGE_LABEL, type LogRange } from "./types";

const RANGES: LogRange[] = ["24h", "7d", "30d", "90d"];

export function LogRangeSelector({
    value,
    onChange,
}: {
    value: LogRange;
    onChange: (range: LogRange) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1">
            {RANGES.map((range) => {
                const selected = value === range;
                return (
                    <button
                        key={range}
                        type="button"
                        onClick={() => onChange(range)}
                        aria-pressed={selected}
                        className={cn(
                            "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                            selected
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {LOG_RANGE_LABEL[range]}
                    </button>
                );
            })}
        </div>
    );
}
