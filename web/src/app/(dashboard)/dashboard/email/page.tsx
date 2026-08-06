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
    return <EmailOverview />;
}
