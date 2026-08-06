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
        <ProfileSettings
            currentUser={{
                email: session.user.email,
                name: session.user.name,
            }}
        />
    );
}
