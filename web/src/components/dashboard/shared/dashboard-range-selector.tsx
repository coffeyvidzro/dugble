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
    <div className="inline-flex h-9 items-center gap-0.5 rounded-[10px] border bg-muted/50 p-[3px]">
      {ranges.map((range) => {
        const selected = value === range;
        return (
          <button
            key={range}
            type="button"
            onClick={() => onChange(range)}
            aria-pressed={selected}
            className={cn(
              "h-7 rounded-[7px] px-3 text-[13px] font-medium transition-colors",
              selected
                ? "bg-background text-foreground shadow-xs"
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
