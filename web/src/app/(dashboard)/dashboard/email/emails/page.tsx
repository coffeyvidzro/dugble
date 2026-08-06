import { EmailsLogView } from "@/components/dashboard/email/emails-page/emails-log-view";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Emails",
    description:
        "Browse sent and received email activity, filter by status or date, and send a one-off transactional email.",
    path: "/dashboard/email/emails",
    preset: "dashboard",
});

export default function Page() {
    return <EmailsLogView />;
}
