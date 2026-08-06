import { BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
    title: "SMS Reports",
    description: "Analyze A2P SMS performance and delivery reports.",
    path: "/dashboard/sms/reports",
    preset: "dashboard",
});

export default function Page() {
    return (
        <PlaceholderPage
            title="Reports"
            description="SMS delivery and engagement reports."
            icon={BarChart3}
        />
    );
}
