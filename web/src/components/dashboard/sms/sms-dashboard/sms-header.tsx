import { MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function SmsHeader({
  deliveryRatePct,
  actions,
}: {
  deliveryRatePct: number;
  actions?: ReactNode;
}) {
  return (
    <PortalHeroHeader
      title="SMS overview"
      description="A2P delivery, sender IDs, and message performance at a glance."
      actions={actions}
      badge={
        <>
          <MessageSquare className="size-3.5" />
          {deliveryRatePct.toFixed(1)}% delivered
        </>
      }
    />
  );
}
