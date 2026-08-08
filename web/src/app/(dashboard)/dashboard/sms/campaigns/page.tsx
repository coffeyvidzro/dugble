import { constructMetadata } from "@/utils/metadata";
import { CampaignsHeader } from "@/components/dashboard/sms/campaigns/campaigns-header";
import { CampaignsList } from "@/components/dashboard/sms/campaigns/campaigns-list";
import { getCampaignPool } from "@/components/dashboard/sms/campaigns/types";

export const metadata = constructMetadata({
    title: "SMS Campaigns",
    description: "Create and monitor SMS campaigns from your Dugble workspace.",
    path: "/dashboard/sms/campaigns",
    preset: "dashboard",
});

export default function Page() {
    const activeCount = getCampaignPool().filter(
        (campaign) =>
            campaign.status === "active" || campaign.status === "sending",
    ).length;

    return (
        <div className="mx-auto w-full max-w-6xl pb-6 ">
            <CampaignsHeader activeCount={activeCount} />
            <CampaignsList />
        </div>
    );
}
