import { TeamSettings } from "@/components/dashboard/team/team-settings";
import { requireSession } from "@/lib/session";

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
