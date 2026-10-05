// src/hooks/queries/use-billing-api.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "@/lib/api/endpoints";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type ChangePlanInput,
  changePlanInputSchema,
  planListSchema,
  type SubscriptionChargesParams,
  subscriptionChargesResponseSchema,
  subscriptionSchema,
  type TopUpInput,
  topUpInputSchema,
  topUpResponseSchema,
  type WalletLedgerParams,
  walletLedgerResponseSchema,
  walletSchema,
} from "@/types/billing-api";

export function usePlans() {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.billingApi.plans(teamId),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet("/plans", planListSchema, { signal, teamId }),
    staleTime: 60_000,
  });
}

export function useSubscription() {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.billingApi.subscription(teamId),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet("/subscription", subscriptionSchema, { signal, teamId }),
    staleTime: 30_000,
  });
}

function buildChargesQuery(params: SubscriptionChargesParams): string {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  return qs ? `/subscription/charges?${qs}` : "/subscription/charges";
}

export function useSubscriptionCharges(
  params: SubscriptionChargesParams = { limit: 20 },
) {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.billingApi.subscriptionCharges(teamId, params),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet(buildChargesQuery(params), subscriptionChargesResponseSchema, {
        signal,
        teamId,
      }),
    staleTime: 30_000,
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChangePlanInput) =>
      apiMutate(
        "/subscription",
        "POST",
        subscriptionSchema,
        changePlanInputSchema.parse(input),
      ),
    onSuccess: (subscription) => {
      queryClient.setQueryData(queryKeys.billingApi.team(), subscription);
      queryClient.invalidateQueries({
        queryKey: queryKeys.billingApi.team(),
      });
    },
  });
}

export function useCancelPlanChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate("/subscription/cancel-change", "POST", subscriptionSchema),
    onSuccess: (subscription) => {
      queryClient.setQueryData(queryKeys.billingApi.team(), subscription);
      queryClient.invalidateQueries({
        queryKey: queryKeys.billingApi.team(),
      });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate("/subscription/cancel", "POST", subscriptionSchema),
    onSuccess: (subscription) => {
      queryClient.setQueryData(queryKeys.billingApi.team(), subscription);
    },
  });
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate("/subscription/reactivate", "POST", subscriptionSchema),
    onSuccess: (subscription) => {
      queryClient.setQueryData(queryKeys.billingApi.team(), subscription);
    },
  });
}

export function useWallet() {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.billingApi.wallet(teamId),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet("/wallet", walletSchema, { signal, teamId }),
    staleTime: 15_000,
  });
}

export function useWalletLedger(params: WalletLedgerParams = { limit: 25 }) {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.billingApi.walletLedger(teamId, params),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet(endpoints.walletLedger(params), walletLedgerResponseSchema, {
        signal,
      }),
    staleTime: 15_000,
  });
}

export function useTopUpWallet() {
  return useMutation({
    mutationFn: (input: TopUpInput) =>
      apiMutate(
        "/wallet/topup",
        "POST",
        topUpResponseSchema,
        topUpInputSchema.parse(input),
      ),
  });
}
