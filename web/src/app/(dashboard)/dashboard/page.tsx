import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Overview",
    description:
        "Launch your messaging workspace, create API keys, and prepare your first customer notification flow.",
    path: "/dashboard",
    preset: "dashboard",
});

export default function Page() {
    return <DashboardOverview />;
}
