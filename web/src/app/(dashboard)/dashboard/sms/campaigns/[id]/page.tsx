import { notFound } from "next/navigation";
import { CampaignDetail } from "@/components/dashboard/sms/campaigns/campaign-detail";
import { isUuid } from "@/lib/security/route-params";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Campaign",
  description: "Campaign details and delivery stats.",
  path: "/dashboard/sms/campaigns",
  preset: "dashboard",
});

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isUuid(id)) notFound();

  return <CampaignDetail campaignId={id} />;
}
