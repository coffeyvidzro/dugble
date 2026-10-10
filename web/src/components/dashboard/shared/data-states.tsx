import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** First-use or filtered-empty state: icon, title, one sentence, actions. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-1 flex size-11 items-center justify-center rounded-full border border-dashed border-foreground/20 bg-muted/50 text-muted-foreground">
        <Icon className="size-[18px]" />
      </span>
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {actions && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/** Inline error with an optional retry, for a section that failed to load. */
export function ErrorState({
  title,
  description,
  onRetry,
  className,
}: {
  title: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-danger">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * Table-shaped loading placeholder. `columns` are CSS grid track sizes so the
 * skeleton matches the real table's proportions.
 */
export function TableSkeleton({
  rows = 6,
  columns = ["7rem", "minmax(0,1fr)", "minmax(0,2fr)", "5rem"],
  className,
}: {
  rows?: number;
  columns?: string[];
  className?: string;
}) {
  const rowKeys = Array.from({ length: rows }, (_, i) => `row-${i}`);
  const colKeys = columns.map((column, i) => `col-${i}-${column}`);
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn("divide-y divide-border/60", className)}
    >
      <span className="sr-only">Loading…</span>
      {rowKeys.map((rowKey, rowIndex) => (
        <div
          key={rowKey}
          className="grid items-center gap-4 px-4 py-3.5"
          style={{ gridTemplateColumns: columns.join(" ") }}
        >
          {colKeys.map((colKey, colIndex) => (
            <Skeleton
              key={`${rowKey}-${colKey}`}
              className={cn(
                colIndex === 0 ? "h-5 rounded-full" : "h-3",
                // Vary widths so the placeholder doesn't look like a grid.
                colIndex > 0 && (rowIndex + colIndex) % 3 === 0 && "w-3/4",
                colIndex > 0 && (rowIndex + colIndex) % 3 === 1 && "w-11/12",
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** 2px indeterminate line shown along the top of a list while it refetches. */
export function RefetchBar({ active }: { active: boolean }) {
  return (
    <div aria-hidden className="relative h-0.5 overflow-hidden">
      {active && (
        <div className="absolute inset-y-0 left-0 w-1/4 animate-progress bg-signal" />
      )}
    </div>
  );
}

/**
 * Generic content-shaped placeholder that replaces "Loading…" spinners.
 * `page` approximates a detail page (title + two blocks); `section` a card
 * body or list.
 */
export function LoadingBlock({
  label,
  variant = "section",
  className,
}: {
  label: string;
  variant?: "section" | "page";
  className?: string;
}) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={cn(
        "w-full",
        variant === "page" ? "space-y-6 py-2" : "space-y-3 px-4 py-6",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      {variant === "page" ? (
        <>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-72 max-w-full" />
          </div>
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </>
      ) : (
        <>
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-1/2" />
        </>
      )}
    </div>
  );
}
