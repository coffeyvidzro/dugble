import { LayoutTemplate } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Email Templates",
  description: "Create and manage reusable transactional email templates.",
  url: "/dashboard/email/templates",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Templates"
      description="Reusable HTML templates."
      icon={LayoutTemplate}
    />
  );
}
