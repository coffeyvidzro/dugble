import Link from "next/link";

import { Globe } from "lucide-react";

import { PortalHeroHeader } from "../../../portal-hero-header";
import type { SendingDomain } from "@/components/dashboard/email/domains/utils/types";

export function DomainsHeader({ domains }: { domains: SendingDomain[] }) {
    const verifiedCount = domains.filter(
        (domain) => domain.status === "verified",
    ).length;

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
                    {" > Domains"}
                </>
            }
            title="Domains"
            description="Verify a domain you own to send and receive email from your own address."
            badge={
                <>
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-signal" />
                    </span>
                    <Globe className="size-3.5" />
                    {verifiedCount}/{domains.length} verified
                </>
            }
        />
    );
}
