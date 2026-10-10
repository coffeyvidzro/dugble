import { Mail } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function EmailHeader({
  deliverabilityPct,
}: {
  deliverabilityPct: number;
}) {
  return (
    <PortalHeroHeader
      title="Email overview"
      description="Transactional delivery, domains, and engagement at a glance."
      badge={
        <>
          <Mail className="size-3.5" />
          {deliverabilityPct.toFixed(1)}% delivered
        </>
      }
    />
  );
}
