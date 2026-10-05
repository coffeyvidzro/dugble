import { ProfileSettings } from "@/components/dashboard/profile/profile-settings";
import { requireSession } from "@/lib/session";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Profile Settings",
  description: "Manage your Dugble profile settings.",
  path: "/dashboard/settings/profile",
  preset: "dashboard",
});

export default async function Page() {
  await requireSession();

  return <ProfileSettings />;
}
