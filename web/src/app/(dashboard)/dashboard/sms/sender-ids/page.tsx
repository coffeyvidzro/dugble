import { SenderIdStatsGrid } from "@/components/dashboard/sms/sender-ids/sender-id-stats-grid";
import { SenderIdsHeader } from "@/components/dashboard/sms/sender-ids/sender-ids-header";
import { SenderIdsList } from "@/components/dashboard/sms/sender-ids/sender-ids-list";
import { PrefetchBoundary } from "@/components/providers/prefetch-boundary";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Sender IDs",
  description: "Manage approved sender IDs for A2P SMS delivery.",
  path: "/dashboard/sms/sender-ids",
  preset: "dashboard",
});

export default function Page() {
  return (
    <PrefetchBoundary queries={["senderIds"]}>
      <div className="mx-auto w-full max-w-6xl pb-6">
        <SenderIdsHeader />
        <div className="space-y-6 animate-fade-up">
          <SenderIdStatsGrid />
          <SenderIdsList />
        </div>
      </div>
    </PrefetchBoundary>
  );
}
