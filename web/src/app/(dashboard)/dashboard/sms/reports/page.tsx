import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { BarChart3 } from "lucide-react";

export default function Page() {
    return (
        <PlaceholderPage
            title="Reports"
            description="SMS delivery and engagement reports."
            icon={BarChart3}
        />
    );
}
