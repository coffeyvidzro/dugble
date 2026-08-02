import { ManualPaymentConfirmationCard } from "./manual-payment-confirmation-card";
import { BankTransferCard } from "./bank-transfer-card";
import { UsdtPaymentCard } from "./usdt-payment-card";
import type { TopUpMethod } from "./types";

export function ManualPaymentTab({
    reference,
    onSubmitted,
}: {
    reference: string;
    onSubmitted: (
        amountCents: number,
        method: Extract<TopUpMethod, "bank_transfer" | "usdt">,
    ) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <BankTransferCard reference={reference} />
                <UsdtPaymentCard reference={reference} />
            </div>
            <ManualPaymentConfirmationCard onSubmitted={onSubmitted} />
        </div>
    );
}
