import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { Send } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="Send SMS"
      description="Compose and send a one-off SMS message."
      icon={Send}
    />
  );
}
