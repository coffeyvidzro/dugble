import { ShieldCheck } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Security Settings",
  description: "Manage security settings for your Dugble account.",
  path: "/dashboard/settings/security",
  preset: "dashboard",
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
