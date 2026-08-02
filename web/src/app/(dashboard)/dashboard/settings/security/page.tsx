import { SecuritySettings } from "@/components/dashboard/security/security-settings";
import { constructMetadata } from "@/utils/metadata";
import { requireSession } from "@/lib/session";

export const metadata = constructMetadata({
    title: "Security Settings",
    description: "Manage security settings for your Dugble account.",
    path: "/dashboard/settings/security",
    preset: "dashboard",
});

export default async function Page() {
    const session = await requireSession();

    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-8">
            <SecuritySettings currentUserEmail={session.user.email} />
        </div>
    );
}
