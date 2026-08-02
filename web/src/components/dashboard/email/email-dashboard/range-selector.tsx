import { EMAIL_RANGE_LABEL, type EmailRange } from "./types";
import { cn } from "@/lib/utils";

const RANGES: EmailRange[] = ["7d", "30d", "90d"];

export function RangeSelector({
    value,
    onChange,
}: {
    value: EmailRange;
    onChange: (range: EmailRange) => void;
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
                        {EMAIL_RANGE_LABEL[range]}
                    </button>
                );
            })}
        </div>
    );
}
