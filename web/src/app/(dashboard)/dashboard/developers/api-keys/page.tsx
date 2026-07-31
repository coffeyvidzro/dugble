import { KeyRound } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "API Keys",
  description: "Create and manage Dugble API keys for your workspace.",
  path: "/dashboard/developers/api-keys",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PlaceholderPage
      title="API Keys"
      description="Create and manage API credentials."
      icon={KeyRound}
    />
  );
}
