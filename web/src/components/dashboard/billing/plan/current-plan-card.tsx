"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import { Card } from "@/components/ui/card";
import {
  useCancelSubscription,
  useReactivateSubscription,
} from "@/hooks/queries/use-billing-api";
import type { Plan, Subscription } from "@/types/billing-api";
import {
  formatDate,
  formatMinorUnits,
  getPeriodProgress,
} from "../shared/format";

export function CurrentPlanCard({
  subscription,
  plans,
}: {
  subscription: Subscription;
  plans: Plan[];
}) {
  const currentPlan = plans.find((p) => p.code === subscription.plan_code);
  const cancelSubscription = useCancelSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const { percent, daysLeft, hasEnded } = getPeriodProgress(
    subscription.current_period_start,
    subscription.current_period_end,
  );

  const periodStatusLabel = subscription.cancel_at_period_end
    ? "Ends this period"
    : hasEnded
      ? "Period ended"
      : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;

  return (
    <Card className="overflow-hidden border-border/40 shadow-sm">
      <div className="p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Current plan
            </p>
            <h2 className="mt-1 truncate font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {currentPlan?.name ?? subscription.plan_code}
            </h2>
          </div>
          <span className="shrink-0 rounded-full border border-border/40 bg-muted/30 px-3 py-1 text-xs font-medium capitalize text-foreground">
            {subscription.status}
          </span>
        </div>

        <p className="mt-5 flex flex-wrap items-baseline gap-1.5 sm:mt-6">
          {currentPlan?.price ? (
            <>
              <span className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {formatMinorUnits(
                  currentPlan.price.amount_units,
                  currentPlan.price.currency,
                )}
              </span>
              <span className="text-sm text-muted-foreground">/ period</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">
              Custom pricing for your billing market
            </span>
          )}
        </p>

        <div className="mt-7 space-y-2.5 sm:mt-9">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Billing period
            </p>
            <p className="shrink-0 font-mono text-xs font-medium text-foreground">
              {periodStatusLabel}
            </p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground">
            <span className="truncate">
              {formatDate(subscription.current_period_start)}
            </span>
            <span className="truncate text-right">
              {formatDate(subscription.current_period_end)}
            </span>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-border/40 pt-5 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {subscription.cancel_at_period_end
              ? "Your workspace reverts to no plan once this period ends."
              : "Renews automatically at the end of this period."}
          </p>
          {subscription.cancel_at_period_end ? (
            <button
              type="button"
              onClick={() => reactivateSubscription.mutate()}
              disabled={reactivateSubscription.isPending}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-signal/40 px-3.5 py-1.5 text-xs font-medium text-signal transition-colors hover:bg-signal/10 disabled:opacity-50 sm:w-auto"
            >
              {reactivateSubscription.isPending && (
                <Loader2 className="size-3.5 animate-spin" />
              )}
              Reactivate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmCancelOpen(true)}
              className="self-start text-xs font-medium text-muted-foreground underline underline-offset-2 transition-colors hover:text-danger sm:self-auto"
            >
              Cancel subscription
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="Cancel your subscription?"
        description="Your plan stays active until the end of the current billing period, then it won't renew."
        confirmLabel="Cancel subscription"
        onConfirm={() => {
          cancelSubscription.mutate(undefined, {
            onSuccess: () => setConfirmCancelOpen(false),
          });
        }}
      />
    </Card>
  );
}
