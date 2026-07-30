import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { ArrowLeftRight } from "lucide-react";

export default function Page() {
    return (
        <PlaceholderPage
            title="Transactions"
            description="Every charge and top-up, itemized."
            icon={ArrowLeftRight}
        />
    );
}
