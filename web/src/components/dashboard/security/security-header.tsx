// src/components/dashboard/security/security-header.tsx

import { PortalHeroHeader } from "../portal-hero-header";

export function SecurityHeader() {
  return (
    <PortalHeroHeader
      breadcrumb="Settings / Security"
      title="Security"
      description="Manage your password, two-factor authentication, and active sessions."
    />
  );
}
