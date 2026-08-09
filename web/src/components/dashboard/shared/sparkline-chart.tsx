import { cn } from "@/lib/utils";

export type MetricTone = "positive" | "negative" | "neutral";

const TONE_CLASSES: Record<MetricTone, { stroke: string; fill: string }> = {
    positive: { stroke: "text-signal", fill: "fill-signal/10" },
    negative: { stroke: "text-danger", fill: "fill-danger/10" },
    neutral: {
        stroke: "text-muted-foreground",
        fill: "fill-muted-foreground/10",
    },
};

function buildSparklinePoints(
    values: number[],
    width: number,
    height: number,
    padding: number,
): string {
    if (values.length === 0) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX =
        values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
    return values
        .map((v, i) => {
            const x = padding + i * stepX;
            const y =
                padding + (1 - (v - min) / range) * (height - padding * 2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
}

export function SparklineChart({
    values,
    tone,
    width = 100,
    height = 32,
    padding = 2,
    className,
}: {
    values: number[];
    tone: MetricTone;
    width?: number;
    height?: number;
    padding?: number;
    className?: string;
}) {
    const toneClasses = TONE_CLASSES[tone];
    const linePoints = buildSparklinePoints(values, width, height, padding);
    const areaPoints = `${padding},${height - padding} ${linePoints} ${width - padding},${height - padding}`;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className={cn("h-10 w-full", className)}
            aria-hidden="true"
        >
            <polygon points={areaPoints} className={toneClasses.fill} />
            <polyline
                points={linePoints}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                className={toneClasses.stroke}
            />
        </svg>
    );
}
