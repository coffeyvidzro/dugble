import { HistoryHeader } from "@/components/dashboard/sms/history/history-header";
import { HistoryOverview } from "@/components/dashboard/sms/history/history-overview";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "SMS History",
  description: "Review A2P SMS delivery history and message details.",
  path: "/dashboard/sms/history",
  preset: "dashboard",
});

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      <HistoryHeader />
      <HistoryOverview />
    </div>
  );
}
