// src/app/(dashboard)/dashboard/sms/campaigns/page.tsx

import { CampaignsHeader } from "@/components/dashboard/sms/campaigns/campaigns-header";
import { CampaignsList } from "@/components/dashboard/sms/campaigns/campaigns-list";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "SMS Campaigns",
  description: "Create and monitor SMS campaigns from your Dugble workspace.",
  path: "/dashboard/sms/campaigns",
  preset: "dashboard",
});

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      <CampaignsHeader />
      <CampaignsList />
    </div>
  );
}
