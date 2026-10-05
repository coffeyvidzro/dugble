"use client";

import { Loader2 } from "lucide-react";
import { useCancelPlanChange } from "@/hooks/queries/use-billing-api";
import type { Plan, Subscription } from "@/types/billing-api";
import { formatDate } from "../shared/format";

export function PendingChangeBanner({
  subscription,
  plans,
}: {
  subscription: Subscription;
  plans: Plan[];
}) {
  const cancelPlanChange = useCancelPlanChange();

  if (!subscription.pending_plan_code) return null;

  const pendingPlan = plans.find(
    (p) => p.code === subscription.pending_plan_code,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-l-2 border-l-signal bg-signal/5 px-4 py-3 text-sm text-foreground">
      <span>
        Switching to{" "}
        <strong className="font-medium">
          {pendingPlan?.name ?? subscription.pending_plan_code}
        </strong>
        {subscription.pending_plan_effective_at
          ? ` on ${formatDate(subscription.pending_plan_effective_at)}`
          : " next billing period"}
        .
      </span>
      <button
        type="button"
        onClick={() => cancelPlanChange.mutate()}
        disabled={cancelPlanChange.isPending}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-signal underline underline-offset-2 transition-colors hover:text-signal/80 disabled:opacity-50"
      >
        {cancelPlanChange.isPending && (
          <Loader2 className="size-3.5 animate-spin" />
        )}
        Cancel change
      </button>
    </div>
  );
}
