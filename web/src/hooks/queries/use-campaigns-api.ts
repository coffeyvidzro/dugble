"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { keepPreviousTeamData } from "@/lib/api/team-placeholder";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type CampaignListParams,
  type CreateCampaignInput,
  campaignAnalyticsSchema,
  campaignCostEstimateSchema,
  campaignExclusionsSchema,
  campaignListSchema,
  campaignPreviewSchema,
  campaignRecipientListSchema,
  campaignSchema,
  createCampaignInputSchema,
  type DuplicateCampaignInput,
  duplicateCampaignInputSchema,
  type ScheduleCampaignInput,
  type SendCampaignInput,
  scheduleCampaignInputSchema,
  sendCampaignInputSchema,
  type UpdateCampaignInput,
  updateCampaignInputSchema,
} from "@/types/campaign-api";

function buildListQuery(params: CampaignListParams): string {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  return qs ? `/campaigns?${qs}` : "/campaigns";
}

export function useCampaignsApi(params: CampaignListParams = {}) {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.campaignsApi.list(teamId, params),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet(buildListQuery(params), campaignListSchema, { signal, teamId }),
    placeholderData: keepPreviousTeamData(teamId),
    staleTime: 15_000,
  });
}

export function useCampaignApi(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaignsApi.detail(campaignId),
    queryFn: ({ signal }) =>
      apiGet(`/campaigns/${encodeURIComponent(campaignId)}`, campaignSchema, {
        signal,
      }),
    enabled: Boolean(campaignId),
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCampaignInput) =>
      apiMutate(
        "/campaigns",
        "POST",
        campaignSchema,
        createCampaignInputSchema.parse(input),
      ),
    onSuccess: (campaign) => {
      queryClient.setQueryData(
        queryKeys.campaignsApi.detail(campaign.id),
        campaign,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaignsApi.lists(),
      });
    },
  });
}

export function useUpdateCampaign(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCampaignInput) =>
      apiMutate(
        `/campaigns/${encodeURIComponent(campaignId)}`,
        "PATCH",
        campaignSchema,
        updateCampaignInputSchema.parse(input),
      ),
    onSuccess: (campaign) => {
      queryClient.setQueryData(
        queryKeys.campaignsApi.detail(campaignId),
        campaign,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaignsApi.lists(),
      });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) =>
      apiMutate(
        `/campaigns/${encodeURIComponent(campaignId)}`,
        "DELETE",
        campaignSchema,
      ),
    onSuccess: (_data, campaignId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.campaignsApi.detail(campaignId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaignsApi.lists(),
      });
    },
  });
}

export function useDuplicateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      input = {},
    }: {
      campaignId: string;
      input?: DuplicateCampaignInput;
    }) =>
      apiMutate(
        `/campaigns/${encodeURIComponent(campaignId)}/duplicate`,
        "POST",
        campaignSchema,
        duplicateCampaignInputSchema.parse(input),
      ),
    onSuccess: (campaign) => {
      queryClient.setQueryData(
        queryKeys.campaignsApi.detail(campaign.id),
        campaign,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaignsApi.lists(),
      });
    },
  });
}

export function usePreviewCampaign(campaignId: string) {
  return useMutation({
    mutationFn: () =>
      apiMutate(
        `/campaigns/${encodeURIComponent(campaignId)}/preview`,
        "POST",
        campaignPreviewSchema,
      ),
  });
}

export function useSendCampaignByIdMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      input = {},
    }: {
      campaignId: string;
      input?: SendCampaignInput;
    }) =>
      apiMutate(
        `/campaigns/${encodeURIComponent(campaignId)}/send`,
        "POST",
        campaignSchema,
        sendCampaignInputSchema.parse(input),
      ),
    onSuccess: (campaign) => {
      queryClient.setQueryData(
        queryKeys.campaignsApi.detail(campaign.id),
        campaign,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaignsApi.lists(),
      });
    },
  });
}

export function useScheduleCampaignByIdMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      input,
    }: {
      campaignId: string;
      input: ScheduleCampaignInput;
    }) =>
      apiMutate(
        `/campaigns/${encodeURIComponent(campaignId)}/schedule`,
        "POST",
        campaignSchema,
        scheduleCampaignInputSchema.parse(input),
      ),
    onSuccess: (campaign) => {
      queryClient.setQueryData(
        queryKeys.campaignsApi.detail(campaign.id),
        campaign,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaignsApi.lists(),
      });
    },
  });
}

export function useCancelCampaign(campaignId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate(
        `/campaigns/${encodeURIComponent(campaignId)}/cancel`,
        "POST",
        campaignSchema,
      ),
    onSuccess: (campaign) => {
      queryClient.setQueryData(
        queryKeys.campaignsApi.detail(campaignId),
        campaign,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaignsApi.lists(),
      });
    },
  });
}

export function useCampaignRecipients(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaignsApi.recipients(campaignId),
    queryFn: ({ signal }) =>
      apiGet(
        `/campaigns/${encodeURIComponent(campaignId)}/recipients`,
        campaignRecipientListSchema,
        { signal },
      ),
    enabled: Boolean(campaignId),
  });
}

export function useCampaignCostEstimate(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaignsApi.costEstimate(campaignId),
    queryFn: ({ signal }) =>
      apiGet(
        `/campaigns/${encodeURIComponent(campaignId)}/cost-estimate`,
        campaignCostEstimateSchema,
        { signal },
      ),
    enabled: Boolean(campaignId),
  });
}

export function useCampaignExclusions(campaignId: string) {
  return useQuery({
    queryKey: queryKeys.campaignsApi.exclusions(campaignId),
    queryFn: ({ signal }) =>
      apiGet(
        `/campaigns/${encodeURIComponent(campaignId)}/exclusions`,
        campaignExclusionsSchema,
        { signal },
      ),
    enabled: Boolean(campaignId),
  });
}

export function useCampaignAnalytics(campaignId: string) {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.campaignsApi.analytics(campaignId),
    queryFn: ({ signal }) =>
      apiGet(
        `/campaigns/${encodeURIComponent(campaignId)}/analytics`,
        campaignAnalyticsSchema,
        { signal, teamId },
      ),
    enabled: Boolean(teamId) && Boolean(campaignId),
  });
}
