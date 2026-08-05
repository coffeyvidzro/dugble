import { cn } from "@/lib/utils";
import { EMAIL_STATUS_LABEL } from "../email-dashboard/types";
import { EVENT_SERIES_COLOR, type EventSeriesId } from "./types";

export function EventSeriesLegend({
    seriesIds,
    hiddenSeries,
    onToggle,
}: {
    seriesIds: EventSeriesId[];
    hiddenSeries: Set<EventSeriesId>;
    onToggle: (id: EventSeriesId) => void;
}) {
    return (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 pt-3">
            {seriesIds.map((id) => {
                const isHidden = hiddenSeries.has(id);
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onToggle(id)}
                        aria-pressed={!isHidden}
                        className={cn(
                            "flex items-center gap-1.5 text-xs font-medium transition-opacity",
                            isHidden
                                ? "text-muted-foreground/50"
                                : "text-foreground",
                        )}
                    >
                        <span
                            className="size-2 rounded-full transition-opacity"
                            style={{
                                backgroundColor: `var(${EVENT_SERIES_COLOR[id]})`,
                                opacity: isHidden ? 0.4 : 1,
                            }}
                        />
                        {EMAIL_STATUS_LABEL[id]}
                    </button>
                );
            })}
        </div>
    );
}
