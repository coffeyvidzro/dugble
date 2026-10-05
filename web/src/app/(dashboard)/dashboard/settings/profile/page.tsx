// src/app/(dashboard)/dashboard/settings/profile/page.tsx

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
  // Auth gate only now — the (dashboard) layout already calls
  // requireSession() too, but that's deduped for free by React's cache()
  // within a single request, so this isn't a second network call. Data
  // itself now comes from useCurrentUser() client-side rather than being
  // passed down as a prop; see profile-settings.tsx.
  await requireSession();

  return <ProfileSettings />;
}
