import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { PrefetchBoundary } from "@/components/providers/prefetch-boundary";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Overview",
  description:
    "Launch your messaging workspace, create API keys, and prepare your first customer notification flow.",
  path: "/dashboard",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PrefetchBoundary queries={["smsAnalytics", "emailAnalytics"]}>
      <DashboardOverview />
    </PrefetchBoundary>
  );
}
