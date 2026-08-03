import { TemplatesOverview } from "@/components/dashboard/email/templates/templates-overview";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Email Templates",
    description: "Create and manage reusable transactional email templates.",
    path: "/dashboard/email/templates",
    preset: "dashboard",
});

export default function Page() {
    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-2">
            <TemplatesOverview />
        </div>
    );
}
