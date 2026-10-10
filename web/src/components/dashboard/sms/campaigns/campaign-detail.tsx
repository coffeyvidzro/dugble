"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
import {
  useCampaignAnalytics,
  useCampaignApi,
} from "@/hooks/queries/use-campaigns-api";
import { useSenderId } from "@/hooks/queries/use-sender-ids";
import { SmsPreviewBubble } from "../../shared/sms-preview-bubble";
import { CampaignActions } from "./campaign-actions";
import { CampaignStatsGrid } from "./campaign-stats-grid";
import { CampaignSummaryCard } from "./campaign-summary-card";

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const searchParams = useSearchParams();
  const justCreated = searchParams.get("created") === "1";

  const campaignQuery = useCampaignApi(campaignId);
  const analyticsQuery = useCampaignAnalytics(campaignId);
  const { data: sender } = useSenderId(campaignQuery.data?.sender_id ?? "");

  if (campaignQuery.isPending) {
    return (
      <LoadingBlock
        label="Loading campaign…"
        variant="page"
        className="mx-auto w-full max-w-5xl pb-6 pt-16"
      />
    );
  }

  if (campaignQuery.isError || !campaignQuery.data) {
    return (
      <div className="mx-auto w-full max-w-5xl pb-6">
        <div className="mb-6 space-y-1">
          <Link
            href="/dashboard/sms/campaigns"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Campaigns
          </Link>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          Couldn&apos;t find that campaign. It may not exist, or you may not
          have access to it.
        </div>
      </div>
    );
  }

  const campaign = campaignQuery.data;

  return (
    <div className="mx-auto w-full max-w-5xl pb-6">
      <div className="mb-6 space-y-1">
        <Link
          href="/dashboard/sms/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Campaigns
        </Link>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Campaign details
        </h1>
      </div>

      {justCreated && (
        <div className="mb-6 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
          This campaign was just created. Stats will populate here once it
          starts sending.
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <CampaignSummaryCard campaign={campaign} />
            <CampaignActions campaign={campaign} />
          </div>
          <div className="overflow-hidden rounded-lg border border-border/40 lg:col-span-2">
            <SmsPreviewBubble
              senderLabel={sender?.name ?? campaign.sender_id}
              message={campaign.body}
            />
          </div>
        </div>

        {analyticsQuery.isPending ? (
          <LoadingBlock label="Loading analytics…" />
        ) : analyticsQuery.isError || !analyticsQuery.data ? (
          <ErrorState title="Couldn't load campaign analytics" />
        ) : (
          <CampaignStatsGrid analytics={analyticsQuery.data} />
        )}
      </div>
    </div>
  );
}
