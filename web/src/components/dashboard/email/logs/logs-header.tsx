import { ScrollText } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";
import Link from "next/link";

export function LogsHeader({ successRatePct }: { successRatePct: number }) {
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
                    {" > Logs"}
                </>
            }
            title="Logs"
            description="Inspect every send request, status codes, delivery events, and webhook attempts."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    <ScrollText className="size-3.5" />
                    {successRatePct.toFixed(1)}% success
                </>
            }
        />
    );
}
