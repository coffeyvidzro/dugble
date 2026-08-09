import { constructMetadata } from "@/utils/metadata";
import { SmsOverview } from "@/components/dashboard/sms/sms-dashboard/sms-overview";

export const metadata = constructMetadata({
    title: "SMS",
    description:
        "Manage A2P SMS sending, sender IDs, campaigns, delivery history, and reports.",
    path: "/dashboard/sms",
    preset: "dashboard",
});

export default function Page() {
    return <SmsOverview />;
}
