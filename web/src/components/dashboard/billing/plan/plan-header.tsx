import { PortalHeroHeader } from "../../portal-hero-header";

export function PlanHeader({ status }: { status: string | null }) {
  return (
    <PortalHeroHeader
      title="Plan & Billing"
      description="See what you're on, switch plans, and review past charges."
      badge={status && <>{status}</>}
    />
  );
}
