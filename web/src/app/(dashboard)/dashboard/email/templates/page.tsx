import { TemplatesOverview } from "@/components/dashboard/email/templates/templates-overview";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Email Templates",
    description: "Create and manage reusable transactional email templates.",
    path: "/dashboard/email/templates",
    preset: "dashboard",
});

export default function Page() {
    return <TemplatesOverview />;
}
