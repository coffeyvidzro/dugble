import { Radio } from "lucide-react";
import { PortalHeroHeader } from "../portal-hero-header";

export function WebhookHeader({
  endpointCount,
  isLoading = false,
}: {
  endpointCount: number;
  isLoading?: boolean;
}) {
  return (
    <PortalHeroHeader
      breadcrumb="Developers / Webhooks"
      title="Webhooks"
      description="Get notified in real time when domain, email, and SMS events happen in your workspace."
      badge={
        <>
          <Radio className="size-3.5" />
          {isLoading
            ? "Loading…"
            : `${endpointCount} ${endpointCount === 1 ? "endpoint" : "endpoints"}`}
        </>
      }
    />
  );
}
