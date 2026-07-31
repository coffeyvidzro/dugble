import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { Megaphone } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="Campaigns"
      description="Scheduled and recurring SMS sends."
      icon={Megaphone}
    />
  );
}
