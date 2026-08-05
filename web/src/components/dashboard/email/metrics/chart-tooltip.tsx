import { formatDate } from "../email-dashboard/types";

type TooltipItem = {
    label: string;
    value: string;
    colorVar: string;
};

export function ChartTooltip({
    date,
    items,
    leftPercent,
}: {
    date: Date;
    items: TooltipItem[];
    leftPercent: number;
}) {
    const clampedLeft = Math.min(Math.max(leftPercent, 12), 88);

    return (
        <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-border/60 bg-popover px-3 py-2 shadow-lg"
            style={{ left: `${clampedLeft}%` }}
        >
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                {formatDate(date)}
            </p>
            <div className="space-y-1">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center gap-2 text-xs"
                    >
                        <span
                            className="size-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: `var(${item.colorVar})` }}
                        />
                        <span className="text-muted-foreground">
                            {item.label}
                        </span>
                        <span className="ml-auto font-medium text-foreground">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
