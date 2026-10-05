"use client";

import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCampaignsApi } from "@/hooks/queries/use-campaigns-api";
import { useSegments } from "@/hooks/queries/use-segments";
import {
  CAMPAIGN_FILTER_LABEL,
  type CampaignFilter,
  matchesCampaignFilter,
} from "@/types/campaign-api";
import { DashboardRangeSelector } from "../../shared/dashboard-range-selector";
import { CampaignsTable } from "./campaigns-table";

const FILTERS: CampaignFilter[] = [
  "all",
  "draft",
  "scheduled",
  "sending",
  "completed",
];

function CampaignsListContent() {
  const [filter, setFilter] = useQueryState(
    "status",
    parseAsStringLiteral(FILTERS).withDefault("all").withOptions({
      history: "replace",
    }),
  );
  const {
    data: campaigns,
    isPending,
    isError,
  } = useCampaignsApi({ limit: 100 });
  const { data: segments } = useSegments();

  const segmentsById = useMemo(
    () => new Map((segments ?? []).map((segment) => [segment.id, segment])),
    [segments],
  );

  const filtered = useMemo(
    () =>
      (campaigns ?? []).filter((campaign) =>
        matchesCampaignFilter(campaign.status, filter),
      ),
    [campaigns, filter],
  );

  return (
    <Card className="border-border/40 shadow-sm animate-fade-up">
      <CardHeader className="flex flex-col items-start gap-4 border-b border-border/40 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl">All campaigns</CardTitle>
          <CardDescription>
            {isPending
              ? "Loading…"
              : `${filtered.length} of ${(campaigns ?? []).length} campaigns`}
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

      {isError ? (
        <p className="py-16 text-center text-sm text-danger">
          Couldn&apos;t load campaigns. Try refreshing the page.
        </p>
      ) : isPending ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading campaigns…
        </div>
      ) : (
        <CampaignsTable campaigns={filtered} segmentsById={segmentsById} />
      )}
    </Card>
  );
}

export function CampaignsList() {
  return (
    <RequireActiveTeam description="Create or select a team to manage campaigns.">
      <CampaignsListContent />
    </RequireActiveTeam>
  );
}
