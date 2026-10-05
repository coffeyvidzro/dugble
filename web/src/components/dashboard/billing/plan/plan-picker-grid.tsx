"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/dashboard/shared/confirm-dialog";
import { useChangePlan } from "@/hooks/queries/use-billing-api";
import type { Plan } from "@/types/billing-api";
import { PlanCard } from "./plan-card";

export function PlanPickerGrid({ plans }: { plans: Plan[] }) {
  const changePlan = useChangePlan();
  const [target, setTarget] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Available plans
        </h2>
        <p className="text-sm text-muted-foreground">
          Switching takes effect at the start of your next billing period.
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.code}
            plan={plan}
            isPending={changePlan.isPending && target?.code === plan.code}
            onSelect={() => {
              setError(null);
              setTarget(plan);
            }}
          />
        ))}
      </div>

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => !open && setTarget(null)}
        title={`Switch to ${target?.name}?`}
        description="This takes effect at the start of your next billing period."
        confirmLabel="Confirm switch"
        onConfirm={() => {
          if (!target) return;
          changePlan.mutate(
            { plan: target.code },
            {
              onSuccess: () => setTarget(null),
              onError: (err) => {
                setError(
                  err instanceof Error
                    ? err.message
                    : "Couldn't switch plans. Try again.",
                );
                setTarget(null);
              },
            },
          );
        }}
      />
    </div>
  );
}
