import { PlaceholderPage } from "@/components/dashboard/placeholder-page";
import { LineChart } from "lucide-react";

export default function Page() {
    return (
        <PlaceholderPage
            title="Metrics"
            description="Deliverability charts."
            icon={LineChart}
        />
    );
}
