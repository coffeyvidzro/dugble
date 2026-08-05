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
    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-2">
            <MetricsOverview />
        </div>
    );
}
