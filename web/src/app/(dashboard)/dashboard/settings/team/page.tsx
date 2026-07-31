import { Group } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Team Settings",
  description: "Manage team access for your Dugble workspace.",
  url: "/dashboard/settings/team",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Team"
      description="Create and manage your team."
      icon={Group}
    />
  );
}
