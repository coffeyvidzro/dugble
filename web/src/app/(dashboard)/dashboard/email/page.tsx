import { EmailOverview } from "@/components/dashboard/email/email-dashboard/email-overview";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Email",
    description:
        "Manage transactional email sending, domains, templates, logs, and metrics.",
    path: "/dashboard/email",
    preset: "dashboard",
});

export default function Page() {
    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-2">
            <EmailOverview />
        </div>
    );
}
