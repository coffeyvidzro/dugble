import { Receipt } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { TransactionsPanel } from "./transactions-panel";
import type { WalletTransaction } from "./types";
import { Card } from "@/components/ui/card";

export function TransactionsCard({
    transactions,
}: {
    transactions: WalletTransaction[];
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={Receipt}
                title="Transactions"
                description="Every top-up and usage charge on your wallet."
            />
            <TransactionsPanel transactions={transactions} />
        </Card>
    );
}
