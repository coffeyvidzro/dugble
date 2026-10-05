// src/app/(dashboard)/dashboard/email/domains/page.tsx

import { DomainsOverview } from "@/components/dashboard/email/domains/list/domains-overview";
import { PrefetchBoundary } from "@/components/providers/prefetch-boundary";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Email Domains",
  description: "Manage sending domains for transactional email.",
  path: "/dashboard/email/domains",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PrefetchBoundary queries={["senderDomains"]}>
      <DomainsOverview />
    </PrefetchBoundary>
  );
}
