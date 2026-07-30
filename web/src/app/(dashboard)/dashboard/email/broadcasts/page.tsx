import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { Megaphone } from "lucide-react";

export default function Page() {
    return (
        <PlaceholderPage
            title="Broadcasts"
            description="One-time and scheduled sends."
            icon={Megaphone}
        />
    );
}
