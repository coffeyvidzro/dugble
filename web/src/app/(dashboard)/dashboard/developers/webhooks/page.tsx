import { WebhooksSettings } from "@/components/dashboard/webhooks/webhooks-settings";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Webhooks",
    description: "Configure webhook endpoints for real-time delivery events.",
    path: "/dashboard/developers/webhooks",
    preset: "dashboard",
});

export default function Page() {
    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-8">
            <WebhooksSettings />
        </div>
    );
}
