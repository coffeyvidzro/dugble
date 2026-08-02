import { LayoutTemplate } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
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
        <PlaceholderPage
            title="Templates"
            description="Reusable HTML templates."
            icon={LayoutTemplate}
        />
    );
}
