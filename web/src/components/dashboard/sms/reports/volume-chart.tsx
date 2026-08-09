import type { DailyVolumePoint } from "./types";

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 16, right: 12, bottom: 8, left: 44 };

function formatShortDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VolumeChart({ points }: { points: DailyVolumePoint[] }) {
    const innerWidth = WIDTH - PADDING.left - PADDING.right;
    const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const maxValue = Math.max(...points.map((point) => point.sent), 1);
    const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;

    function toXY(value: number, index: number) {
        const x = PADDING.left + index * stepX;
        const y = PADDING.top + (1 - value / maxValue) * innerHeight;
        return { x, y };
    }

    const sentPoints = points.map((point, i) => toXY(point.sent, i));
    const deliveredPoints = points.map((point, i) => toXY(point.delivered, i));

    const toPolyline = (pts: { x: number; y: number }[]) =>
        pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");

    const sentLine = toPolyline(sentPoints);
    const deliveredLine = toPolyline(deliveredPoints);
    const deliveredArea = `${PADDING.left},${PADDING.top + innerHeight} ${deliveredLine} ${PADDING.left + innerWidth},${PADDING.top + innerHeight}`;

    const gridFractions = [0, 0.5, 1];
    const firstDate = points[0]?.date;
    const midDate = points[Math.floor(points.length / 2)]?.date;
    const lastDate = points[points.length - 1]?.date;

    return (
        <div>
            <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full border-2 border-muted-foreground/50" />
                    Sent
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-signal" />
                    Delivered
                </span>
            </div>

            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="none"
                className="h-56 w-full"
                role="img"
                aria-label="Messages sent and delivered over time"
            >
                {gridFractions.map((fraction) => {
                    const y = PADDING.top + fraction * innerHeight;
                    return (
                        <line
                            key={fraction}
                            x1={PADDING.left}
                            x2={WIDTH - PADDING.right}
                            y1={y}
                            y2={y}
                            className="stroke-border/40"
                            strokeWidth="1"
                        />
                    );
                })}

                <polygon points={deliveredArea} className="fill-signal/10" />
                <polyline
                    points={deliveredLine}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    className="text-signal"
                />
                <polyline
                    points={sentLine}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    vectorEffect="non-scaling-stroke"
                    className="text-muted-foreground/60"
                />

                <text
                    x={PADDING.left - 8}
                    y={PADDING.top + 4}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9px]"
                >
                    {maxValue.toLocaleString()}
                </text>
                <text
                    x={PADDING.left - 8}
                    y={PADDING.top + innerHeight + 4}
                    textAnchor="end"
                    className="fill-muted-foreground text-[9px]"
                >
                    0
                </text>
            </svg>

            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{firstDate ? formatShortDate(firstDate) : ""}</span>
                <span>{midDate ? formatShortDate(midDate) : ""}</span>
                <span>{lastDate ? formatShortDate(lastDate) : ""}</span>
            </div>
        </div>
    );
}
