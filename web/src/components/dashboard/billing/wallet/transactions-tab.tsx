import { TransactionsCard } from "./transactions-card";
import type { WalletTransaction } from "./types";

export function TransactionsTab({
    transactions,
}: {
    transactions: WalletTransaction[];
}) {
    return <TransactionsCard transactions={transactions} />;
}
