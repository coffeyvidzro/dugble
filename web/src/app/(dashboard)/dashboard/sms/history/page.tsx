import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { History } from "lucide-react";

export default function Page() {
    return (
        <PlaceholderPage
            title="History"
            description="Full SMS send history."
            icon={History}
        />
    );
}
