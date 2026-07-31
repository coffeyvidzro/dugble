import { Group } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Team Settings",
  description: "Manage team access for your Dugble workspace.",
  path: "/dashboard/settings/team",
  preset: "dashboard",
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
