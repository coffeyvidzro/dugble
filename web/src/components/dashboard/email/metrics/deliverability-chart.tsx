// src/components/dashboard/email/metrics/deliverability-chart.tsx

"use client";

import { useMemo, useRef, useState } from "react";
import type { EmailAnalyticsWindow } from "@/types/email-api";
import { ChartTooltip } from "./chart-tooltip";
import {
  buildAreaPath,
  buildSmoothLinePath,
  formatAxisDate,
  formatCompactNumber,
  pickTickIndices,
  scaleValuesToPoints,
} from "./chart-utils";
import { EventSeriesLegend } from "./event-series-legend";
import {
  EMAIL_SERIES_COLOR,
  EMAIL_SERIES_LABEL,
  type EmailSeriesId,
  type EventFilter,
} from "./types";

const CHART_WIDTH = 960;
const CHART_HEIGHT = 240;
const PADDING_X = 4;
const PADDING_Y = 12;

const MULTI_SERIES: EmailSeriesId[] = [
  "total",
  "delivered",
  "opened",
  "clicked",
  "bounced",
];

export function DeliverabilityChart({
  series,
  eventFilter,
}: {
  series: EmailAnalyticsWindow["series"];
  eventFilter: EventFilter;
}) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<EmailSeriesId>>(
    new Set(),
  );
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const visibleSeries: EmailSeriesId[] =
    eventFilter === "all"
      ? MULTI_SERIES.filter((id) => !hiddenSeries.has(id))
      : [eventFilter];

  const maxValue = useMemo(() => {
    const values = visibleSeries.flatMap((id) => series.map((p) => p[id]));
    return Math.max(...values, 1);
  }, [visibleSeries, series]);

  const seriesPoints = useMemo(() => {
    return visibleSeries.map((id) => {
      const values = series.map((p) => p[id]);
      const points = scaleValuesToPoints(
        values,
        CHART_WIDTH,
        CHART_HEIGHT,
        PADDING_X,
        PADDING_Y,
        maxValue,
      );
      return { id, linePath: buildSmoothLinePath(points), points };
    });
  }, [visibleSeries, series, maxValue]);

  const ticks = pickTickIndices(
    series.length,
    series.length > 20 ? 8 : series.length,
  );

  function toggleSeries(id: EmailSeriesId) {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size >= MULTI_SERIES.length) return prev;
      return next;
    });
  }

  function handleMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || series.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const index = Math.round(relativeX * (series.length - 1));
    setHoverIndex(Math.min(Math.max(index, 0), series.length - 1));
  }

  const hoveredPoint = hoverIndex !== null ? series[hoverIndex] : null;
  const hoverX =
    hoverIndex !== null && series.length > 1
      ? PADDING_X +
        (hoverIndex / (series.length - 1)) * (CHART_WIDTH - PADDING_X * 2)
      : null;

  return (
    <div className="px-2 pb-4 pt-6 sm:px-6">
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          className="h-56 w-full sm:h-64"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {seriesPoints.map(({ id }) => (
              <linearGradient
                key={id}
                id={`metrics-gradient-${id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={`var(${EMAIL_SERIES_COLOR[id]})`}
                  stopOpacity={eventFilter === "all" ? 0.14 : 0.26}
                />
                <stop
                  offset="100%"
                  stopColor={`var(${EMAIL_SERIES_COLOR[id]})`}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>

          {[0.25, 0.5, 0.75].map((fraction) => (
            <line
              key={fraction}
              x1={0}
              x2={CHART_WIDTH}
              y1={CHART_HEIGHT * fraction}
              y2={CHART_HEIGHT * fraction}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border/40"
            />
          ))}

          {seriesPoints.map(({ id, points, linePath }) => (
            <g key={id}>
              {eventFilter !== "all" && (
                <path
                  d={buildAreaPath(linePath, points, CHART_HEIGHT)}
                  fill={`url(#metrics-gradient-${id})`}
                  stroke="none"
                />
              )}
              <path
                d={linePath}
                fill="none"
                stroke={`var(${EMAIL_SERIES_COLOR[id]})`}
                strokeWidth={eventFilter === "all" ? 1.75 : 2}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}

          {hoverX !== null && (
            <line
              x1={hoverX}
              x2={hoverX}
              y1={0}
              y2={CHART_HEIGHT}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="text-foreground/30"
            />
          )}

          {hoverIndex !== null &&
            seriesPoints.map(({ id, points }) => {
              const point = points[hoverIndex];
              if (!point) return null;
              return (
                <circle
                  key={id}
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill={`var(${EMAIL_SERIES_COLOR[id]})`}
                />
              );
            })}
        </svg>

        {hoveredPoint && hoverX !== null && (
          <ChartTooltip
            date={new Date(hoveredPoint.date)}
            leftPercent={(hoverX / CHART_WIDTH) * 100}
            items={seriesPoints.map(({ id }) => ({
              label: EMAIL_SERIES_LABEL[id],
              value: formatCompactNumber(hoveredPoint[id]),
              colorVar: EMAIL_SERIES_COLOR[id],
            }))}
          />
        )}
      </div>

      <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
        {ticks.map((index) => {
          const point = series[index];
          return point ? (
            <span key={index}>{formatAxisDate(new Date(point.date))}</span>
          ) : null;
        })}
      </div>

      {eventFilter === "all" && (
        <EventSeriesLegend
          seriesIds={MULTI_SERIES}
          hiddenSeries={hiddenSeries}
          onToggle={toggleSeries}
        />
      )}
    </div>
  );
}
