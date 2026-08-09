import Link from "next/link";

import { PortalHeroHeader } from "../../portal-hero-header";
import { Megaphone } from "lucide-react";

export function CampaignsHeader({ activeCount }: { activeCount: number }) {
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
                    {" > Campaigns"}
                </>
            }
            title="Campaigns"
            description="Scheduled and recurring SMS sends to your audience."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    <Megaphone className="size-3.5" />
                    {activeCount} active
                </>
            }
        />
    );
}
