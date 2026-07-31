import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { Receipt } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="Invoices"
      description="Billing history and receipts."
      icon={Receipt}
    />
  );
}
