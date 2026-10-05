// src/app/(dashboard)/dashboard/billing/plan/page.tsx

import { PlanOverview } from "@/components/dashboard/billing/plan/plan-overview";
import { PrefetchBoundary } from "@/components/providers/prefetch-boundary";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Plan & Billing",
  description: "Manage your Dugble subscription plan and billing charges.",
  path: "/dashboard/billing/plan",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PrefetchBoundary queries={["plans", "subscription"]}>
      <PlanOverview />
    </PrefetchBoundary>
  );
}
