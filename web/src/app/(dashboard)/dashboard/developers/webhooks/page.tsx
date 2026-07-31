import { Radio } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Webhooks",
  description: "Configure webhook endpoints for real-time delivery events.",
  url: "/dashboard/developers/webhooks",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Webhooks"
      description="Configure delivery event endpoints."
      icon={Radio}
    />
  );
}
