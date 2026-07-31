import { Receipt } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Invoices",
  description: "Review Dugble invoices for your workspace.",
  url: "/dashboard/billing/invoices",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Invoices"
      description="Billing history and receipts."
      icon={Receipt}
    />
  );
}
