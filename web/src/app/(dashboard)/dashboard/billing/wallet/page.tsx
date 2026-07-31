import { Wallet } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Wallet",
  description: "Review workspace wallet balance and top-ups.",
  path: "/dashboard/billing/wallet",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PlaceholderPage
      title="My wallet"
      description="Balance and top-ups."
      icon={Wallet}
    />
  );
}
