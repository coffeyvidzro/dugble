import { ShieldCheck } from "lucide-react";

import { SectionCardHeader } from "@/components/dashboard/profile/section-card-header";
import { Card } from "@/components/ui/card";
import { TwoFactorPanel } from "./two-factor-panel";

export function TwoFactorCard({
    enabled,
    recoveryCodes,
    onEnabled,
    onDisabled,
}: {
    enabled: boolean;
    recoveryCodes: string[];
    onEnabled: (recoveryCodes: string[]) => void;
    onDisabled: () => void;
}) {
    return (
        <Card className="border-border/40 shadow-sm">
            <SectionCardHeader
                icon={ShieldCheck}
                title="Two-Factor Authentication"
                description="Add an extra layer of security to your account with a time-based one-time code."
                tone={enabled ? "positive" : "neutral"}
            />
            <TwoFactorPanel
                enabled={enabled}
                recoveryCodes={recoveryCodes}
                onEnabled={onEnabled}
                onDisabled={onDisabled}
            />
        </Card>
    );
}
