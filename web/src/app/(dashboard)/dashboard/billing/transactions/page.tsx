import { ArrowLeftRight } from "lucide-react";
import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
    title: "Transactions",
    description: "Review billing transactions for your Dugble workspace.",
    path: "/dashboard/billing/transactions",
    preset: "dashboard",
});

export default function Page() {
    return (
        <PlaceholderPage
            title="Transactions"
            description="Every charge and top-up, itemized."
            icon={ArrowLeftRight}
        />
    );
}
