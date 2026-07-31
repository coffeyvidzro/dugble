import { FingerprintPattern } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Sender IDs",
  description: "Manage approved sender IDs for A2P SMS delivery.",
  path: "/dashboard/sms/sender-ids",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Sender IDs"
      description="Manage and request sender IDs for your SMS communications"
      icon={FingerprintPattern}
    />
  );
}
