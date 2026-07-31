import { History } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "SMS History",
  description: "Review A2P SMS delivery history and message details.",
  url: "/dashboard/sms/history",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="History"
      description="Full SMS send history."
      icon={History}
    />
  );
}
