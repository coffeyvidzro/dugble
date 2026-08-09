import { constructMetadata } from "@/utils/metadata";
import { CampaignDetail } from "@/components/dashboard/sms/campaigns/campaign-detail";
import { resolveCampaign } from "@/components/dashboard/sms/campaigns/types";

export const metadata = constructMetadata({
    title: "Campaign",
    description: "Campaign details and delivery stats.",
    path: "/dashboard/sms/campaigns",
    preset: "dashboard",
});

export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | undefined>>;
}) {
    const { id } = await params;
    const search = await searchParams;

    const { campaign, isNew } = resolveCampaign(id, search);

    return <CampaignDetail campaign={campaign} isNew={isNew} />;
}
