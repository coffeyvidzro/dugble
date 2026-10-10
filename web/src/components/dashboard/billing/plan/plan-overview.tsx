"use client";

import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
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
        <ErrorState
          title="Couldn't load your billing details"
          description="Try refreshing the page."
        />
      ) : !subscription || !plans ? (
        <LoadingBlock label="Loading plan details…" variant="page" />
      ) : (
        <div className="space-y-10">
          <div className="space-y-4">
            <PendingChangeBanner
              subscription={subscriptionQuery.data}
              plans={plansQuery.data}
            />
            <CurrentPlanCard
              subscription={subscriptionQuery.data}
              plans={plansQuery.data}
            />
          </div>

          <div>
            <PlanPickerGrid plans={plansQuery.data} />
          </div>

          <div>
            {chargesQuery.isError ? (
              <ErrorState title="Couldn't load billing history" />
            ) : chargesQuery.isPending ? (
              <LoadingBlock label="Loading billing history…" />
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
