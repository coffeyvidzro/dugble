import { PortalHeroHeader } from "../../portal-hero-header";

export function PlanHeader({ status }: { status: string | null }) {
  return (
    <PortalHeroHeader
      breadcrumb="Billing / Plan"
      title="Plan & Billing"
      description="See what you're on, switch plans, and review past charges."
      badge={
        status && (
          <>
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-signal" />
            </span>
            {status}
          </>
        )
      }
    />
  );
}
