import { SecuritySettings } from "@/components/dashboard/security/security-settings";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Security Settings",
  description: "Manage security settings for your Dugble account.",
  path: "/dashboard/settings/security",
  preset: "dashboard",
});

export default function Page() {
  return <SecuritySettings />;
}
