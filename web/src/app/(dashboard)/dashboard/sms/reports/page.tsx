import { ReportsOverview } from "@/components/dashboard/sms/reports/reports-overview";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "SMS Analytics",
  description: "Analyze A2P SMS performance and delivery reports.",
  path: "/dashboard/sms/reports",
  preset: "dashboard",
});

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-7xl pb-6">
      <ReportsOverview />
    </div>
  );
}
