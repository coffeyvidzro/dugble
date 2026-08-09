import { MessageSquare } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function SmsHeader({
    deliveryRatePct,
}: {
    deliveryRatePct: number;
}) {
    return (
        <PortalHeroHeader
            breadcrumb="SMS"
            title="Overview"
            description="A2P delivery, sender IDs, and message performance at a glance."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    <MessageSquare className="size-3.5" />
                    {deliveryRatePct.toFixed(1)}% delivered
                </>
            }
        />
    );
}
