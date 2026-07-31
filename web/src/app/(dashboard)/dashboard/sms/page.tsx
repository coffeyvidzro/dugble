import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { Send } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="Send SMS"
      description="Your messaging performance overview"
      icon={Send}
    />
  );
}
