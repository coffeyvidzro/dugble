import { Megaphone } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Email Broadcasts",
  description:
    "Create and monitor email broadcasts from your Dugble workspace.",
  path: "/dashboard/email/broadcasts",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Broadcasts"
      description="One-time and scheduled sends."
      icon={Megaphone}
    />
  );
}
