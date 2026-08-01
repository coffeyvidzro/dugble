import { ProfileSettings } from "@/components/dashboard/profile/profile-settings";
import { constructMetadata } from "@/utils/metadata";
import { requireSession } from "@/lib/session";

export const metadata = constructMetadata({
    title: "Profile Settings",
    description: "Manage your Dugble profile settings.",
    path: "/dashboard/settings/profile",
    preset: "dashboard",
});

export default async function Page() {
    const session = await requireSession();

    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-8">
            <ProfileSettings
                currentUser={{
                    email: session.user.email,
                    name: session.user.name,
                }}
            />
        </div>
    );
}
