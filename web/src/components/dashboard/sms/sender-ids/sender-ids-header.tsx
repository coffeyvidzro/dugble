import Link from "next/link";

import { PortalHeroHeader } from "../../portal-hero-header";
import { Fingerprint } from "lucide-react";

export function SenderIdsHeader({ pendingCount }: { pendingCount: number }) {
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
                    {" > Sender-IDs"}
                </>
            }
            title="Sender IDs"
            description="Manage and request sender IDs for your SMS communications."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pending opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-pending" />
                    </span>
                    <Fingerprint className="size-3.5" />
                    {pendingCount} pending review
                </>
            }
        />
    );
}
