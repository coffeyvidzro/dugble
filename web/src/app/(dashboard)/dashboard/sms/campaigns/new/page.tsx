import { constructMetadata } from "@/utils/metadata";
import { BuilderHeader } from "@/components/dashboard/sms/campaigns/builder-header";
import { CampaignBuilder } from "@/components/dashboard/sms/campaigns/campaign-builder";

export const metadata = constructMetadata({
    title: "New Campaign",
    description: "Build a new SMS campaign for your audience.",
    path: "/dashboard/sms/campaigns/new",
    preset: "dashboard",
});

export default function Page() {
    return (
        <div className="mx-auto w-full max-w-4xl pb-6">
            <BuilderHeader />
            <CampaignBuilder />
        </div>
    );
}
