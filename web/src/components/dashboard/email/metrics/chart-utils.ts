export type ChartPoint = { x: number; y: number };
export type TimeSeriesPoint = { date: Date; value: number };

export function scaleValuesToPoints(
    values: number[],
    width: number,
    height: number,
    paddingX = 0,
    paddingY = 0,
    fixedMax?: number,
): ChartPoint[] {
    if (values.length === 0) return [];
    const max = fixedMax ?? Math.max(...values, 0.0001);
    const range = max || 1;
    const stepX =
        values.length > 1 ? (width - paddingX * 2) / (values.length - 1) : 0;

    return values.map((value, index) => ({
        x: paddingX + index * stepX,
        y: paddingY + (1 - value / range) * (height - paddingY * 2),
    }));
}

export function buildLinePath(points: ChartPoint[]): string {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
    return points
        .map(
            (point, index) =>
                `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)},${point.y.toFixed(2)}`,
        )
        .join(" ");
}

// Smooths a polyline into cubic bezier segments
export function buildSmoothLinePath(points: ChartPoint[]): string {
    if (points.length < 3) return buildLinePath(points);

    let path = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] ?? p2;

        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }
    return path;
}

export function buildAreaPath(
    linePath: string,
    points: ChartPoint[],
    height: number,
): string {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x.toFixed(2)},${height} L ${first.x.toFixed(2)},${height} Z`;
}

// Picks up to `maxTicks` evenly spaced indices out of `length` items.
export function pickTickIndices(length: number, maxTicks: number): number[] {
    if (length <= 0) return [];
    if (length <= maxTicks) return Array.from({ length }, (_, i) => i);
    const step = (length - 1) / (maxTicks - 1);
    return Array.from({ length: maxTicks }, (_, i) => Math.round(i * step));
}

export function formatAxisDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
    }).format(date);
}

export function formatCompactNumber(value: number): string {
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
}

export function formatPercentage(value: number, digits = 1): string {
    return `${value.toFixed(digits)}%`;
}
