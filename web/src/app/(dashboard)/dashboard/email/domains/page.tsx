import { DomainsOverview } from "@/components/dashboard/email/domains/list/domains-overview";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Email Domains",
    description: "Manage sending domains for transactional email.",
    path: "/dashboard/email/domains",
    preset: "dashboard",
});

export default function Page() {
    return <DomainsOverview />;
}
