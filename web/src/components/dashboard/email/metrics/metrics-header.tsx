import { Activity } from "lucide-react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function MetricsHeader({
  deliverabilityPct,
}: {
  deliverabilityPct: number;
}) {
  return (
    <PortalHeroHeader
      title="Email analytics"
      description="Deliverability and engagement, tracked across every send."
      badge={
        <>
          <Activity className="size-3.5" />
          {deliverabilityPct.toFixed(1)}% deliverability
        </>
      }
    />
  );
}
