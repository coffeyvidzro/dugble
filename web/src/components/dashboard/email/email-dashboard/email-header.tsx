import { Mail } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function EmailHeader({
    deliverabilityPct,
}: {
    deliverabilityPct: number;
}) {
    return (
        <PortalHeroHeader
            breadcrumb="Email"
            title="Overview"
            description="Transactional delivery, domains, and engagement at a glance."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    <Mail className="size-3.5" />
                    {deliverabilityPct.toFixed(1)}% delivered
                </>
            }
        />
    );
}
