// src/components/dashboard/sms/campaigns/campaign-stats-grid.tsx

import { Check, Clock, Send, Users, XCircle } from "lucide-react";
import type { CampaignAnalytics } from "@/types/campaign-api";
import { StatTile } from "../../shared/stat-tile";

export function CampaignStatsGrid({
  analytics,
}: {
  analytics: CampaignAnalytics;
}) {
  const deliveryRate =
    analytics.sent > 0 ? (analytics.delivered / analytics.sent) * 100 : 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <StatTile label="Audience" value={analytics.audience} icon={Users} />
      <StatTile label="Queued" value={analytics.queued} icon={Clock} />
      <StatTile label="Sent" value={analytics.sent} icon={Send} />
      <StatTile
        label="Delivered"
        value={analytics.delivered}
        icon={Check}
        sublabel={`${deliveryRate.toFixed(1)}%`}
      />
      <StatTile
        label="Failed"
        value={analytics.delivery_failed}
        icon={XCircle}
      />
    </div>
  );
}
