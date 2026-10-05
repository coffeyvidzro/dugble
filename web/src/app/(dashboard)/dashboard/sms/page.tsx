// src/app/(dashboard)/dashboard/sms/page.tsx

import { SmsOverview } from "@/components/dashboard/sms/sms-dashboard/sms-overview";
import { PrefetchBoundary } from "@/components/providers/prefetch-boundary";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "SMS",
  description:
    "Manage A2P SMS sending, sender IDs, campaigns, delivery history, and reports.",
  path: "/dashboard/sms",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PrefetchBoundary queries={["smsAnalytics", "senderIds", "webhooks"]}>
      <SmsOverview />
    </PrefetchBoundary>
  );
}
