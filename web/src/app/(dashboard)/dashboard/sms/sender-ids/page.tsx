import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { FingerprintPattern } from "lucide-react";

export default function Page() {
    return (
        <PlaceholderPage
            title="Sender IDs"
            description="Manage and request sender IDs for your SMS communications"
            icon={FingerprintPattern}
        />
    );
}
