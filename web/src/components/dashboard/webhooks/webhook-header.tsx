import { Radio } from "lucide-react";
import { PortalHeroHeader } from "../portal-hero-header";

export function WebhookHeader({
  endpointCount,
  failingCount = 0,
  isLoading = false,
}: {
  endpointCount: number;
  failingCount?: number;
  isLoading?: boolean;
}) {
  return (
    <PortalHeroHeader
      title="Webhooks"
      description="Get notified in real time when domain, email, and SMS events happen in your workspace."
      badge={
        <>
          <Radio className="size-3.5" />
          {isLoading
            ? "Loading…"
            : `${endpointCount} ${endpointCount === 1 ? "endpoint" : "endpoints"}`}
          {failingCount > 0 && (
            <span className="ml-1 font-medium text-pending">
              {failingCount} failing
            </span>
          )}
        </>
      }
    />
  );
}
