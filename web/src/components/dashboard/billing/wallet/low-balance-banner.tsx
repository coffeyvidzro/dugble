import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LowBalanceBanner({
    visible,
    onTopUp,
}: {
    visible: boolean;
    onTopUp: () => void;
}) {
    if (!visible) return null;

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-danger">
                        Your wallet balance is running low
                    </p>
                    <p className="text-sm text-danger/80">
                        Notifications may stop sending once your balance hits
                        zero. Top up now or turn on auto recharge to stay
                        covered.
                    </p>
                </div>
            </div>
            <Button
                type="button"
                size="sm"
                onClick={onTopUp}
                className="shrink-0 bg-danger text-white hover:bg-danger/90"
            >
                Top up now
            </Button>
        </div>
    );
}
