import { LineChart } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Email Metrics",
  description: "Analyze transactional email performance and delivery metrics.",
  path: "/dashboard/email/metrics",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Metrics"
      description="Deliverability charts."
      icon={LineChart}
    />
  );
}
