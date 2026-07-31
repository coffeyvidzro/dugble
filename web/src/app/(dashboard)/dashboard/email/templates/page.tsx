import { LayoutTemplate } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Email Templates",
  description: "Create and manage reusable transactional email templates.",
  path: "/dashboard/email/templates",
  preset: "dashboard",
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
