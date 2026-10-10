import { Skeleton } from "@/components/ui/skeleton";

const STAT_SLOTS = [0, 1, 2, 3] as const;
const ROW_SLOTS = [0, 1, 2, 3, 4, 5] as const;

export function PageSkeleton({ stats = true }: { stats?: boolean }) {
  return (
    <div
      className="mx-auto flex w-full max-w-7xl flex-col gap-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {STAT_SLOTS.map((slot) => (
            <Skeleton key={slot} className="h-24" />
          ))}
        </div>
      )}
      <div className="space-y-2 rounded-2xl border border-border/40 p-4">
        {ROW_SLOTS.map((slot) => (
          <Skeleton key={slot} className="h-10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
