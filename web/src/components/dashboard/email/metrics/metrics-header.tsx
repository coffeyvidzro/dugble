import Link from "next/link";
import { Activity } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function MetricsHeader({
    deliverabilityPct,
}: {
    deliverabilityPct: number;
}) {
    return (
        <PortalHeroHeader
            breadcrumb={
                <>
                    <Link
                        href="/dashboard/email"
                        className="transition-colors hover:text-foreground"
                    >
                        Email
                    </Link>
                    {" > Metrics"}
                </>
            }
            title="Metrics"
            description="Deliverability and engagement, tracked across every send."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    <Activity className="size-3.5" />
                    {deliverabilityPct.toFixed(1)}% deliverability
                </>
            }
        />
    );
}
