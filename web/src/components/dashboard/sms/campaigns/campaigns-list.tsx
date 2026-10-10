"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";
import {
  ErrorState,
  LoadingBlock,
} from "@/components/dashboard/shared/data-states";
import { RequireActiveTeam } from "@/components/dashboard/shared/require-active-team";
import { Card } from "@/components/ui/card";
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
    <Card className="gap-0 py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="max-w-full overflow-x-auto">
          <DashboardRangeSelector
            ranges={FILTERS}
            labels={CAMPAIGN_FILTER_LABEL}
            value={filter}
            onChange={setFilter}
          />
        </div>
        {!isPending && (
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {(campaigns ?? []).length} campaigns
          </span>
        )}
      </div>

      {isError ? (
        <ErrorState
          title="Couldn't load campaigns"
          description="Try refreshing the page."
        />
      ) : isPending ? (
        <LoadingBlock label="Loading campaigns…" />
      ) : (
        <CampaignsTable
          campaigns={filtered}
          segmentsById={segmentsById}
          isFiltered={filter !== "all"}
        />
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
