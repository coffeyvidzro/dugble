import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { Wallet } from "lucide-react";

export default function Page() {
  return (
    <PlaceholderPage
      title="My wallet"
      description="Balance and top-ups."
      icon={Wallet}
    />
  );
}
