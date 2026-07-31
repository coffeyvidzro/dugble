import { KeyRound } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "API Keys",
  description: "Create and manage Dugble API keys for your workspace.",
  url: "/dashboard/developers/api-keys",
  noIndex: true,
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
