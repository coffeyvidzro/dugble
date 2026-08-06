import { WebhooksSettings } from "@/components/dashboard/webhooks/webhooks-settings";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Webhooks",
    description: "Configure webhook endpoints for real-time delivery events.",
    path: "/dashboard/developers/webhooks",
    preset: "dashboard",
});

export default function Page() {
    return <WebhooksSettings />;
}
