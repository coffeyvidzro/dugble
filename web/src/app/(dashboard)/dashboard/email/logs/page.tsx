import { ScrollText } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Email Logs",
  description: "Search and inspect transactional email delivery logs.",
  url: "/dashboard/email/logs",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Logs"
      description="Full email delivery log."
      icon={ScrollText}
    />
  );
}
