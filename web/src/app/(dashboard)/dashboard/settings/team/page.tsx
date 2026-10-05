import { TeamSettings } from "@/components/dashboard/team/team-settings";
import { requireSession } from "@/lib/session";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Team Settings",
  description: "Manage team access for your Dugble workspace.",
  path: "/dashboard/settings/team",
  preset: "dashboard",
});

export default async function Page() {
  await requireSession();

  return <TeamSettings />;
}
