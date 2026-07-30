import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { LayoutTemplate } from "lucide-react";

export default function Page() {
    return (
        <PlaceholderPage
            title="Templates"
            description="Reusable HTML templates."
            icon={LayoutTemplate}
        />
    );
}
