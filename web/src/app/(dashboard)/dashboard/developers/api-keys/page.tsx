import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { KeyRound } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="API Keys"
      description="Create and manage API credentials."
      icon={KeyRound}
    />
  );
}
