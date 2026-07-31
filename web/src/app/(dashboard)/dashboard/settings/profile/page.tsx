import { UserCircle } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Profile Settings",
  description: "Manage your Dugble profile settings.",
  url: "/dashboard/settings/profile",
  noIndex: true,
});

export default function Page() {
  return (
    <PlaceholderPage
      title="Profile"
      description="Your name, email, and avatar."
      icon={UserCircle}
    />
  );
}
