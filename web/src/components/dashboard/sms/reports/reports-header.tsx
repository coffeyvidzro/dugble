import type { ReactNode } from "react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function ReportsHeader({ actions }: { actions?: ReactNode }) {
  return (
    <PortalHeroHeader
      title="SMS analytics"
      description="Monitor and analyze your SMS delivery performance."
      actions={actions}
    />
  );
}
