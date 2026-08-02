import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SecurityRecommendationBanner({
    visible,
    onEnable,
}: {
    visible: boolean;
    onEnable: () => void;
}) {
    if (!visible) return null;

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-pending/30 bg-pending/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-pending" />
                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-pending">
                        Your account isn&apos;t protected by two-factor
                        authentication
                    </p>
                    <p className="text-sm text-pending/80">
                        Add a second step at sign-in so a leaked password alone
                        can&apos;t get anyone into your account.
                    </p>
                </div>
            </div>
            <Button
                type="button"
                size="sm"
                onClick={onEnable}
                className="shrink-0 bg-pending text-white hover:bg-pending/90"
            >
                Enable 2FA
            </Button>
        </div>
    );
}
