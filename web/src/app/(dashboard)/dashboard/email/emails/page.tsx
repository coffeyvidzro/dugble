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
    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-2">
            <EmailsLogView />
        </div>
    );
}
