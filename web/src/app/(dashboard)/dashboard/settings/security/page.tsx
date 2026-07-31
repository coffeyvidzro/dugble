import { ShieldCheck } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Security Settings",
  description: "Manage security settings for your Dugble account.",
  url: "/dashboard/settings/security",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Security"
      description="Password, 2FA, and account security."
      icon={ShieldCheck}
    />
  );
}
