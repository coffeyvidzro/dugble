import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { Radio } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="Webhooks"
      description="Configure delivery event endpoints."
      icon={Radio}
    />
  );
}
