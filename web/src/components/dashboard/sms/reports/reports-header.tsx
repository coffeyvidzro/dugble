import Link from "next/link";

import { PortalHeroHeader } from "../../portal-hero-header";
import { BarChart3 } from "lucide-react";

export function ReportsHeader() {
    return (
        <PortalHeroHeader
            breadcrumb={
                <>
                    <Link
                        href="/dashboard/sms"
                        className="transition-colors hover:text-foreground"
                    >
                        SMS
                    </Link>
                    {" > Reports"}
                </>
            }
            title="Reports"
            description="Monitor and analyze your SMS delivery performance."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    <BarChart3 className="size-3.5" />
                    Live data
                </>
            }
        />
    );
}
