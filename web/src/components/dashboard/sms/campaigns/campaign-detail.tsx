"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CampaignSummaryCard } from "./campaign-summary-card";
import { CampaignStatsGrid } from "./campaign-stats-grid";
import { CampaignActions } from "./campaign-actions";
import { SmsPreviewBubble } from "../../shared/sms-preview-bubble";
import { resolvePreviewMessage } from "../../shared/message-templates";
import type { Campaign, CampaignStatus } from "./types";

export function CampaignDetail({
    campaign,
    isNew,
}: {
    campaign: Campaign;
    isNew: boolean;
}) {
    const [status, setStatus] = useState<CampaignStatus>(campaign.status);

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

            {isNew && (
                <div className="mb-6 rounded-lg border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-signal">
                    This campaign was just created — stats will appear here
                    once it starts sending.
                </div>
            )}

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                    <div className="space-y-4 lg:col-span-3">
                        <CampaignSummaryCard campaign={{ ...campaign, status }} />
                        <CampaignActions status={status} onStatusChange={setStatus} />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-border/40 lg:col-span-2">
                        <SmsPreviewBubble
                            senderLabel={campaign.sender}
                            message={resolvePreviewMessage(campaign.message)}
                        />
                    </div>
                </div>

                <CampaignStatsGrid stats={campaign.stats} />
            </div>
        </div>
    );
}
