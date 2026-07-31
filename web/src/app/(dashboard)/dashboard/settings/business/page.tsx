import { Building2 } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Business Settings",
  description: "Manage business details for your Dugble workspace.",
  path: "/dashboard/settings/business",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Business"
      description="Company details and billing address."
      icon={Building2}
    />
  );
}
