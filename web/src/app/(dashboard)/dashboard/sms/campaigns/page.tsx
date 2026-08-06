import { Megaphone } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
    title: "SMS Campaigns",
    description: "Create and monitor SMS campaigns from your Dugble workspace.",
    path: "/dashboard/sms/campaigns",
    preset: "dashboard",
});

export default function Page() {
    return (
        <PlaceholderPage
            title="Campaigns"
            description="Scheduled and recurring SMS sends."
            icon={Megaphone}
        />
    );
}
