import Link from "next/link";

import { PortalHeroHeader } from "../../portal-hero-header";
import { History } from "lucide-react";

export function HistoryHeader({ totalCount }: { totalCount: number }) {
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
                    {" > History"}
                </>
            }
            title="History"
            description="Search and review every SMS your workspace has sent."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    <History className="size-3.5" />
                    {totalCount.toLocaleString()} total messages
                </>
            }
        />
    );
}
