import { Globe } from "lucide-react";
import type { SenderDomain } from "@/types/sender-domain-api";
import { PortalHeroHeader } from "../../../portal-hero-header";

export function DomainsHeader({ domains }: { domains: SenderDomain[] }) {
  const verifiedCount = domains.filter(
    (domain) => domain.status === "verified",
  ).length;

  return (
    <PortalHeroHeader
      title="Domains"
      description="Verify a domain you own to send email from your own address."
      badge={
        <>
          <Globe className="size-3.5" />
          {verifiedCount}/{domains.length} verified
        </>
      }
    />
  );
}
