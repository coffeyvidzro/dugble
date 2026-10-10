import type { ReactNode } from "react";
import { PortalHeroHeader } from "../../portal-hero-header";

export function EmailsHeader({ actions }: { actions?: ReactNode }) {
  return (
    <PortalHeroHeader
      title="Email logs"
      description="Every transactional email sent from your workspace, newest first."
      actions={actions}
    />
  );
}
