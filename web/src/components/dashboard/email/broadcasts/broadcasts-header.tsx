import { Megaphone } from "lucide-react";

import { PortalHeroHeader } from "../../portal-hero-header";
import Link from "next/link";

export function BroadcastsHeader({
    scheduledCount,
}: {
    scheduledCount: number;
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
                    {" > Broadcasts"}
                </>
            }
            title="Broadcasts"
            description="Reach many recipients at once with one-time sends and scheduled campaigns."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    <Megaphone className="size-3.5" />
                    {scheduledCount} scheduled
                </>
            }
        />
    );
}
