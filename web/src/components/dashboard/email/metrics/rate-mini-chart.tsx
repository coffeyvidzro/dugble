"use client";

import { useMemo, useRef, useState } from "react";
import {
    buildAreaPath,
    buildSmoothLinePath,
    formatAxisDate,
    formatPercentage,
    pickTickIndices,
    scaleValuesToPoints,
    type TimeSeriesPoint,
} from "./chart-utils";

const WIDTH = 400;
const HEIGHT = 150;
const PADDING_X = 4;
const PADDING_Y = 10;
const AXIS_RIGHT_GUTTER = 34;
const AXIS_TICK_COUNT = 5;

function formatAxisTick(value: number): string {
    if (value === 0) return "0%";
    const rounded =
        value < 1 ? Math.round(value * 100) / 100 : Math.round(value);
    return `${rounded}%`;
}

export function RateMiniChart({
    series,
    riskThreshold,
}: {
    series: TimeSeriesPoint[];
    riskThreshold?: number;
}) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const values = useMemo(() => series.map((point) => point.value), [series]);

    const maxValue = useMemo(() => {
        const dataMax = Math.max(...values, 0.0001);
        const withRisk = riskThreshold
            ? Math.max(dataMax, riskThreshold)
            : dataMax;
        return withRisk * 1.3;
    }, [values, riskThreshold]);

    const plotWidth = WIDTH - AXIS_RIGHT_GUTTER;

    const points = useMemo(
        () =>
            scaleValuesToPoints(
                values,
                plotWidth,
                HEIGHT,
                PADDING_X,
                PADDING_Y,
                maxValue,
            ),
        [values, maxValue, plotWidth],
    );
    const linePath = buildSmoothLinePath(points);
    const areaPath = buildAreaPath(linePath, points, HEIGHT);

    const riskY = riskThreshold
        ? PADDING_Y + (1 - riskThreshold / maxValue) * (HEIGHT - PADDING_Y * 2)
        : null;

    const axisTicks = useMemo(() => {
        return Array.from({ length: AXIS_TICK_COUNT }, (_, i) => {
            const value = (maxValue / (AXIS_TICK_COUNT - 1)) * i;
            const y =
                PADDING_Y + (1 - value / maxValue) * (HEIGHT - PADDING_Y * 2);
            return { value, y };
        });
    }, [maxValue]);

    const dateTicks = pickTickIndices(
        series.length,
        series.length > 6 ? 5 : series.length,
    );

    function handleMouseMove(event: React.MouseEvent<SVGSVGElement>) {
        const svg = svgRef.current;
        if (!svg || series.length === 0) return;
        const rect = svg.getBoundingClientRect();
        const relativeX = (event.clientX - rect.left) / rect.width;
        const viewBoxX = relativeX * WIDTH;
        const index = Math.round((viewBoxX / plotWidth) * (series.length - 1));
        setHoverIndex(Math.min(Math.max(index, 0), series.length - 1));
    }

    const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

    return (
        <div className="px-6 pt-3">
            <div className="relative">
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    preserveAspectRatio="none"
                    className="h-28 w-full"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverIndex(null)}
                >
                    <defs>
                        <linearGradient
                            id="rate-mini-gradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="var(--signal)"
                                stopOpacity="0.22"
                            />
                            <stop
                                offset="100%"
                                stopColor="var(--signal)"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>

                    {axisTicks.map((tick) => (
                        <line
                            key={tick.value}
                            x1={0}
                            x2={plotWidth}
                            y1={tick.y}
                            y2={tick.y}
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-border/40"
                        />
                    ))}

                    {riskY !== null && (
                        <>
                            <line
                                x1={0}
                                x2={plotWidth}
                                y1={riskY}
                                y2={riskY}
                                stroke="var(--pending)"
                                strokeWidth="1"
                                strokeDasharray="4 3"
                            />
                            <text
                                x={2}
                                y={riskY - 4}
                                fontSize="9"
                                style={{ fill: "var(--pending)" }}
                                className="font-mono"
                            >
                                RISK
                            </text>
                        </>
                    )}

                    <path
                        d={areaPath}
                        fill="url(#rate-mini-gradient)"
                        stroke="none"
                    />
                    <path
                        d={linePath}
                        fill="none"
                        stroke="var(--signal)"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />

                    {hoveredPoint && (
                        <>
                            <line
                                x1={hoveredPoint.x}
                                x2={hoveredPoint.x}
                                y1={0}
                                y2={HEIGHT}
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                                className="text-foreground/20"
                            />
                            <circle
                                cx={hoveredPoint.x}
                                cy={hoveredPoint.y}
                                r="3"
                                fill="var(--signal)"
                            />
                        </>
                    )}

                    {axisTicks.map((tick) => (
                        <text
                            key={`label-${tick.value}`}
                            x={plotWidth + 6}
                            y={tick.y + 3}
                            fontSize="9"
                            style={{ fill: "var(--muted-foreground)" }}
                            className="font-mono"
                        >
                            {formatAxisTick(tick.value)}
                        </text>
                    ))}
                </svg>

                {hoveredPoint && hoverIndex !== null && (
                    <div
                        className="pointer-events-none absolute top-1 -translate-x-1/2 rounded-md border border-border/60 bg-popover px-2 py-1 text-xs font-medium shadow-lg"
                        style={{ left: `${(hoveredPoint.x / WIDTH) * 100}%` }}
                    >
                        {formatPercentage(series[hoverIndex].value, 2)}
                    </div>
                )}
            </div>

            <div
                className="mt-2 flex justify-between text-[10px] text-muted-foreground"
                style={{
                    paddingRight: `${(AXIS_RIGHT_GUTTER / WIDTH) * 100}%`,
                }}
            >
                {dateTicks.map((index) => (
                    <span key={index}>
                        {formatAxisDate(series[index].date)}
                    </span>
                ))}
            </div>
        </div>
    );
}
