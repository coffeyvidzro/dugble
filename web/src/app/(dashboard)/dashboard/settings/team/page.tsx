import { TeamSettings } from "@/components/dashboard/team/team-settings";
import { constructMetadata } from "@/utils/metadata";
import { requireSession } from "@/lib/session";

export const metadata = constructMetadata({
    title: "Team Settings",
    description: "Manage team access for your Dugble workspace.",
    path: "/dashboard/settings/team",
    preset: "dashboard",
});

export default async function Page() {
    const session = await requireSession();

    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-8">
            <TeamSettings
                currentUser={{
                    email: session.user.email,
                    name: session.user.name,
                }}
            />
        </div>
    );
}
