import { constructMetadata } from "@/utils/metadata";
import { ReportsHeader } from "@/components/dashboard/sms/reports/reports-header";
import { ReportsOverview } from "@/components/dashboard/sms/reports/reports-overview";

export const metadata = constructMetadata({
    title: "SMS Reports",
    description: "Analyze A2P SMS performance and delivery reports.",
    path: "/dashboard/sms/reports",
    preset: "dashboard",
});

export default function Page() {
    return (
        <div className="mx-auto w-full max-w-6xl pb-6">
            <ReportsHeader />
            <ReportsOverview />
        </div>
    );
}
