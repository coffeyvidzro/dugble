export type BreakdownItem = {
    label: string;
    count: number;
    percentage: number;
    colorVar: string;
};

export function MetricsBreakdownLegend({ items }: { items: BreakdownItem[] }) {
    return (
        <div className="space-y-2 border-t border-border/40 px-6 py-4">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="flex items-center gap-2 text-sm"
                >
                    <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: `var(${item.colorVar})` }}
                    />
                    <span className="font-medium text-foreground">
                        {item.label}
                    </span>
                    <span className="ml-auto text-muted-foreground">
                        {item.count.toLocaleString()}
                    </span>
                    <span className="w-14 text-right font-medium text-foreground">
                        {item.percentage.toFixed(2)}%
                    </span>
                </div>
            ))}
        </div>
    );
}
