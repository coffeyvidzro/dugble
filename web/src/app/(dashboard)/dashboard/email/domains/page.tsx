import { Globe } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Email Domains",
  description: "Manage sending domains for transactional email.",
  url: "/dashboard/email/domains",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Domains"
      description="SPF, DKIM, and DMARC configuration."
      icon={Globe}
    />
  );
}
