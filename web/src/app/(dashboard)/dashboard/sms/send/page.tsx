import { constructMetadata } from "@/utils/metadata";
import { SendHub } from "@/components/dashboard/sms/send-sms/send-hub";

export const metadata = constructMetadata({
    title: "Send SMS",
    description: "Send an A2P SMS message from your Dugble workspace.",
    path: "/dashboard/sms/send",
    preset: "dashboard",
});

export default function Page() {
    return <SendHub />;
}
