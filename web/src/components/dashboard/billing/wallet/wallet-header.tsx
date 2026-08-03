import { Zap } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";
export function WalletHeader({
    autoRechargeEnabled,
}: {
    autoRechargeEnabled: boolean;
}) {
    return (
        <PortalHeroHeader
            breadcrumb="Billing > Wallet"
            title="Wallet"
            description="Fund your workspace balance and manage how Dugble bills your usage."
            badge={
                <>
                    <Zap className="size-3.5" />
                    Auto-recharge {autoRechargeEnabled ? "on" : "off"}
                </>
            }
        />
    );
}
