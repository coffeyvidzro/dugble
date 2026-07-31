import { Radio } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Webhooks",
  description: "Configure webhook endpoints for real-time delivery events.",
  path: "/dashboard/developers/webhooks",
  preset: "dashboard",
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
