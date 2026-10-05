"use client";

import { Loader2 } from "lucide-react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import {
  usePlans,
  useSubscription,
  useSubscriptionCharges,
} from "@/hooks/queries/use-billing-api";
import { ChargesTable } from "./charges-table";
import { CurrentPlanCard } from "./current-plan-card";
import { PendingChangeBanner } from "./pending-change-banner";
import { PlanHeader } from "./plan-header";
import { PlanPickerGrid } from "./plan-picker-grid";

function PlanOverviewContent() {
  const subscriptionQuery = useSubscription();
  const plansQuery = usePlans();
  const chargesQuery = useSubscriptionCharges({ limit: 20 });

  const subscription = subscriptionQuery.data;
  const plans = plansQuery.data;
  const isError = subscriptionQuery.isError || plansQuery.isError;

  return (
    <div className="mx-auto w-full max-w-5xl pb-10">
      <PlanHeader status={subscriptionQuery.data?.status ?? null} />

      {isError ? (
        <p className="py-16 text-center text-sm text-danger">
          Couldn&apos;t load your billing details. Try refreshing the page.
        </p>
      ) : !subscription || !plans ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading plan details…
        </div>
      ) : (
        <div className="space-y-10">
          <div
            className="animate-fade-up space-y-4"
            style={{
              animationDelay: "80ms",
              animationFillMode: "both",
            }}
          >
            <PendingChangeBanner
              subscription={subscriptionQuery.data}
              plans={plansQuery.data}
            />
            <CurrentPlanCard
              subscription={subscriptionQuery.data}
              plans={plansQuery.data}
            />
          </div>

          <div
            className="animate-fade-up"
            style={{
              animationDelay: "140ms",
              animationFillMode: "both",
            }}
          >
            <PlanPickerGrid plans={plansQuery.data} />
          </div>

          <div
            className="animate-fade-up"
            style={{
              animationDelay: "200ms",
              animationFillMode: "both",
            }}
          >
            {chargesQuery.isError ? (
              <p className="py-8 text-center text-sm text-danger">
                Couldn&apos;t load billing history.
              </p>
            ) : chargesQuery.isPending ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading billing history…
              </div>
            ) : (
              <ChargesTable charges={chargesQuery.data?.charges ?? []} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PlanOverview() {
  return (
    <RequireActiveTeam description="Create or select a team to manage your plan and billing.">
      <PlanOverviewContent />
    </RequireActiveTeam>
  );
}
