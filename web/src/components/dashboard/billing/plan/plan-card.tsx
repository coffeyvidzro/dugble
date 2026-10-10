import { Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan } from "@/types/billing-api";
import { formatMinorUnits } from "../shared/format";

export function PlanCard({
  plan,
  onSelect,
  isPending,
}: {
  plan: Plan;
  onSelect: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col gap-5 rounded-xl border p-6 transition-all",
        plan.current
          ? "border-primary/50 bg-primary/[0.03] ring-1 ring-primary/20"
          : "border-border/40 bg-card hover:border-border/70",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate font-heading text-lg font-semibold text-foreground">
          {plan.name}
        </h3>
        {plan.current && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/90">
            Current
          </span>
        )}
      </div>

      <div className="min-w-0">
        {plan.price ? (
          <p className="flex flex-wrap items-baseline gap-1.5">
            <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
              {formatMinorUnits(plan.price.amount_units, plan.price.currency)}
            </span>
            <span className="text-sm text-muted-foreground">/ period</span>
          </p>
        ) : (
          <p className="font-heading text-xl font-medium text-foreground">
            Contact sales
          </p>
        )}
      </div>

      {plan.pending && (
        <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-signal/10 px-2.5 py-1 text-xs font-medium text-signal">
          <Clock className="size-3 shrink-0" />
          <span className="truncate">Scheduled for next period</span>
        </span>
      )}

      <button
        type="button"
        onClick={onSelect}
        disabled={plan.current || !plan.available || isPending}
        className={cn(
          "mt-auto inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          plan.current
            ? "border border-border/60 text-muted-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        {isPending && <Loader2 className="size-3.5 shrink-0 animate-spin" />}
        <span className="truncate">
          {plan.current
            ? "Current plan"
            : !plan.available
              ? "Not available"
              : "Switch to this plan"}
        </span>
      </button>
    </div>
  );
}
