"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import { CampaignsTable } from "./campaigns-table";
import {
    CAMPAIGN_FILTER_LABEL,
    getCampaignPool,
    matchesFilter,
    type CampaignFilter,
} from "./types";

const FILTERS: CampaignFilter[] = [
    "all",
    "draft",
    "scheduled",
    "active",
    "completed",
];

export function CampaignsList() {
    const [filter, setFilter] = useState<CampaignFilter>("all");
    const campaigns = useMemo(() => getCampaignPool(), []);
    const filtered = useMemo(
        () =>
            campaigns.filter((campaign) =>
                matchesFilter(campaign.status, filter),
            ),
        [campaigns, filter],
    );

    return (
        <Card className="border-border/40 shadow-sm animate-fade-up">
            <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-xl">All campaigns</CardTitle>
                    <CardDescription>
                        {filtered.length} of {campaigns.length} campaigns
                    </CardDescription>
                </div>
                <Link
                    href="/dashboard/sms/campaigns/new"
                    className="group/button relative inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20"
                >
                    <Plus className="size-4" />
                    New campaign
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full motion-reduce:hidden"
                    />
                </Link>
            </CardHeader>

            <div className="border-b border-border/40 px-4 py-3">
                <div className="overflow-x-auto">
                    <DashboardRangeSelector
                        ranges={FILTERS}
                        labels={CAMPAIGN_FILTER_LABEL}
                        value={filter}
                        onChange={setFilter}
                    />
                </div>
            </div>

            <CampaignsTable campaigns={filtered} />
        </Card>
    );
}
