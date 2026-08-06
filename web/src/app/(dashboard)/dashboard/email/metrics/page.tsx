import { MetricsOverview } from "@/components/dashboard/email/metrics/metrics-overview";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Email Metrics",
    description:
        "Analyze transactional email performance and delivery metrics.",
    path: "/dashboard/email/metrics",
    preset: "dashboard",
});

export default function Page() {
    return <MetricsOverview />;
}
