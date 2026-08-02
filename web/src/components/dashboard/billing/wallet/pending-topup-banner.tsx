import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    formatCurrency,
    formatRelativeTime,
    type PendingManualTopUp,
} from "./types";

export function PendingTopUpBanner({
    pending,
    onCancel,
}: {
    pending: PendingManualTopUp | null;
    onCancel: () => void;
}) {
    if (!pending) return null;

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-pending/30 bg-pending/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-pending" />
                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-pending">
                        {formatCurrency(pending.amountCents)} top-up awaiting
                        confirmation
                    </p>
                    <p className="text-sm text-pending/80">
                        Submitted {formatRelativeTime(pending.submittedAt)} via{" "}
                        {pending.method === "bank_transfer"
                            ? "bank transfer"
                            : "USDT"}
                        . Reference{" "}
                        <span className="font-mono">{pending.reference}</span>.
                        This usually clears within one business day.
                    </p>
                </div>
            </div>
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onCancel}
                className="shrink-0 border-pending/40 text-pending hover:bg-pending/10"
            >
                Cancel
            </Button>
        </div>
    );
}
