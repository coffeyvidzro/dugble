import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { ScrollText } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="Logs"
      description="Full email delivery log."
      icon={ScrollText}
    />
  );
}
