// src/components/dashboard/email/domains/list/domains-header.tsx

import { Globe } from "lucide-react";
import Link from "next/link";
import type { SenderDomain } from "@/types/sender-domain-api";
import { PortalHeroHeader } from "../../../portal-hero-header";

export function DomainsHeader({ domains }: { domains: SenderDomain[] }) {
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
      description="Verify a domain you own to send email from your own address."
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
