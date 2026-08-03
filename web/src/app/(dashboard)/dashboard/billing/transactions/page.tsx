import { TransactionsDashboard } from "@/components/dashboard/billing/transactions/transactions-dashboard";
import { constructMetadata } from "@/utils/metadata";
import { requireSession } from "@/lib/session";

export const metadata = constructMetadata({
    title: "Transactions",
    description: "Review billing transactions for your Dugble workspace.",
    path: "/dashboard/billing/transactions",
    preset: "dashboard",
});

export default async function Page() {
    await requireSession();

    return (
        <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-5.5">
            <TransactionsDashboard />
        </div>
    );
}
