"use client";

import { cn } from "@/lib/utils";

export function DashboardRangeSelector<TRange extends string>({
    ranges,
    labels,
    value,
    onChange,
}: {
    ranges: readonly TRange[];
    labels: Record<TRange, string>;
    value: TRange;
    onChange: (range: TRange) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/20 p-1 py-1.5">
            {ranges.map((range) => {
                const selected = value === range;
                return (
                    <button
                        key={range}
                        type="button"
                        onClick={() => onChange(range)}
                        aria-pressed={selected}
                        className={cn(
                            "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                            selected
                                ? "bg-card text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {labels[range]}
                    </button>
                );
            })}
        </div>
    );
}
