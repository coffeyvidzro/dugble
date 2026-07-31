import { Send } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Send SMS",
  description: "Send an A2P SMS message from your Dugble workspace.",
  path: "/dashboard/sms/send",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Send SMS"
      description="Compose and send a one-off SMS message."
      icon={Send}
    />
  );
}
