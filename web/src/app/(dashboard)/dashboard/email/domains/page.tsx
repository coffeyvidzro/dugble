import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { Globe } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="Domains"
      description="SPF, DKIM, and DMARC configuration."
      icon={Globe}
    />
  );
}
