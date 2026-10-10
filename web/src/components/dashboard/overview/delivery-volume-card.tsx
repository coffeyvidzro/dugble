import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/dashboard/shared/data-states";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeliveryPoint } from "./delivery-series";

const WIDTH = 640;
const HEIGHT = 236;
const PLOT_LEFT = 44;
const PLOT_RIGHT = WIDTH - 4;
const PLOT_TOP = 12;
const PLOT_BOTTOM = 200;

function niceMax(value: number): number {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 1.5, 2, 3, 4, 5, 6, 8, 10];
  const step = steps.find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

function compact(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function parseDay(date: string): Date {
  return new Date(`${date.slice(0, 10)}T00:00:00Z`);
}

function dayLabel(date: string, dense: boolean, isLast: boolean): string {
  const today = new Date().toISOString().slice(0, 10);
  if (isLast && date.slice(0, 10) === today) return "Today";
  return parseDay(date).toLocaleDateString("en-US", {
    timeZone: "UTC",
    ...(dense ? { month: "short", day: "numeric" } : { weekday: "short" }),
  });
}

export function DeliveryVolumeCard({
  series,
  isPending,
  caption,
}: {
  series: DeliveryPoint[];
  isPending: boolean;
  caption: string;
}) {
  const hasData = series.some((p) => p.total > 0);
  const max = niceMax(Math.max(0, ...series.map((p) => p.total)));
  const plotHeight = PLOT_BOTTOM - PLOT_TOP;
  const slot = series.length > 0 ? (PLOT_RIGHT - PLOT_LEFT) / series.length : 0;
  const barWidth = Math.min(44, slot * 0.62);
  const dense = series.length > 10;
  const ticks = [0, max / 3, (max * 2) / 3, max];
  const y = (v: number) => PLOT_BOTTOM - (v / max) * plotHeight;
  const totals = series.reduce(
    (acc, p) => ({
      delivered: acc.delivered + p.delivered,
      failed: acc.failed + p.failed,
    }),
    { delivered: 0, failed: 0 },
  );

  return (
    <section
      aria-labelledby="delivery-volume-title"
      className="flex flex-col rounded-xl border bg-card p-5 shadow-xs"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="delivery-volume-title"
            className="font-heading text-base leading-6 font-semibold tracking-tight"
          >
            Delivery volume
          </h2>
          <p className="text-[13px] text-muted-foreground">{caption}</p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-signal" />
            Delivered
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px] bg-danger" />
            Failed
          </span>
        </div>
      </div>

      {isPending ? (
        <Skeleton className="mt-4 h-[220px] w-full" />
      ) : !hasData ? (
        <EmptyState
          icon={BarChart3}
          title="No messages in this period"
          description="Delivered and failed messages will chart here as you send."
          className="py-12"
        />
      ) : (
        <svg
          role="img"
          aria-label={`${totals.delivered.toLocaleString()} delivered and ${totals.failed.toLocaleString()} failed messages, ${caption.toLowerCase()}.`}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mt-4 block h-auto w-full font-mono text-[11px]"
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PLOT_LEFT}
                x2={PLOT_RIGHT}
                y1={y(tick)}
                y2={y(tick)}
                className={tick === 0 ? "stroke-border" : "stroke-border/60"}
                strokeDasharray={tick === 0 ? undefined : "2 4"}
              />
              <text
                x={PLOT_LEFT - 8}
                y={y(tick) + 4}
                textAnchor="end"
                className="fill-muted-foreground"
              >
                {compact(tick)}
              </text>
            </g>
          ))}
          {series.map((point, index) => {
            const isLast = index === series.length - 1;
            const x = PLOT_LEFT + index * slot + (slot - barWidth) / 2;
            const deliveredHeight = (point.delivered / max) * plotHeight;
            const failedHeight =
              point.failed > 0
                ? Math.max(2, (point.failed / max) * plotHeight)
                : 0;
            const showLabel = !dense || index % 5 === 0 || isLast;
            return (
              <g
                key={point.date}
                className="transition-opacity hover:opacity-80"
              >
                <title>
                  {`${dayLabel(point.date, true, false)}: ${point.delivered.toLocaleString()} delivered, ${point.failed.toLocaleString()} failed`}
                </title>
                <rect
                  x={x}
                  y={PLOT_BOTTOM - deliveredHeight}
                  width={barWidth}
                  height={deliveredHeight}
                  rx={dense ? 1.5 : 3}
                  className="fill-signal"
                  fillOpacity={isLast ? 1 : 0.55}
                />
                {failedHeight > 0 && (
                  <rect
                    x={x}
                    y={PLOT_BOTTOM - deliveredHeight - failedHeight - 1}
                    width={barWidth}
                    height={failedHeight}
                    rx={1}
                    className="fill-danger"
                  />
                )}
                {showLabel && (
                  <text
                    suppressHydrationWarning
                    x={x + barWidth / 2}
                    y={PLOT_BOTTOM + 22}
                    textAnchor="middle"
                    className={
                      isLast
                        ? "fill-foreground font-semibold"
                        : "fill-muted-foreground"
                    }
                  >
                    {dayLabel(point.date, dense, isLast)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </section>
  );
}
