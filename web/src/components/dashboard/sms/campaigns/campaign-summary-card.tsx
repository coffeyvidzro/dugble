"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSegment } from "@/hooks/queries/use-segments";
import { useSenderId } from "@/hooks/queries/use-sender-ids";
import type { Campaign } from "@/types/campaign-api";
import { formatDate } from "../sms-dashboard/types";
import { CampaignStatusBadge } from "./campaign-status-badge";

export function CampaignSummaryCard({ campaign }: { campaign: Campaign }) {
  const { data: segment } = useSegment(campaign.segment_id);
  const { data: sender } = useSenderId(campaign.sender_id);

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/40 bg-muted/10 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl">{campaign.name}</CardTitle>
          <CardDescription>
            {segment?.name ?? campaign.segment_id} ·{" "}
            {campaign.audience_count.toLocaleString()} recipients
          </CardDescription>
        </div>
        <CampaignStatusBadge status={campaign.status} />
      </CardHeader>
      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-border/40 bg-muted/10 p-3 text-sm text-foreground">
          {campaign.body}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Field label="From" value={sender?.name ?? campaign.sender_id} mono />
          <Field
            label="Scheduled for"
            value={
              campaign.scheduled_at
                ? formatDate(campaign.scheduled_at)
                : "Not scheduled"
            }
          />
          <Field label="Created" value={formatDate(campaign.created_at)} />
        </div>
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={
          mono ? "font-mono text-sm text-foreground" : "text-sm text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}
