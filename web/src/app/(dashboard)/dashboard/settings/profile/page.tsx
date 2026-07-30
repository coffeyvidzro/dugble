import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { UserCircle } from "lucide-react";

export default function Page() {
    return (
        <PlaceholderPage
            title="Profile"
            description="Your name, email, and avatar."
            icon={UserCircle}
        />
    );
}
