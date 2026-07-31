import { Send } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "SMS",
  description:
    "Manage A2P SMS sending, sender IDs, campaigns, delivery history, and reports.",
  url: "/dashboard/sms",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Send SMS"
      description="Your messaging performance overview"
      icon={Send}
    />
  );
}
