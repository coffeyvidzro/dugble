// src/hooks/queries/use-sms-api.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { keepPreviousTeamData } from "@/lib/api/team-placeholder";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  isTerminalSmsStatus,
  type SendSmsBatchInput,
  type SendSmsInput,
  type SmsListParams,
  sendSmsBatchInputSchema,
  sendSmsInputSchema,
  smsAnalyticsSchema,
  smsBatchMutationListSchema,
  smsEventListSchema,
  smsListSchema,
  smsMutationEnvelopeSchema,
  smsResourceSchema,
  updateSmsScheduleInputSchema,
} from "@/types/sms-api";

function buildSmsQuery(params: SmsListParams): string {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));
  if (params.status) searchParams.set("status", params.status);
  if (params.sender) searchParams.set("sender", params.sender);
  if (params.start_date) searchParams.set("start_date", params.start_date);
  if (params.end_date) searchParams.set("end_date", params.end_date);
  if (params.search) searchParams.set("search", params.search);
  const qs = searchParams.toString();
  return qs ? `/sms?${qs}` : "/sms";
}

export function useSmsMessages(params: SmsListParams = { limit: 25 }) {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.smsApi.list(teamId, params),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet(buildSmsQuery(params), smsListSchema, { signal, teamId }),
    placeholderData: keepPreviousTeamData(teamId),
    staleTime: 10_000,
  });
}

export function useSmsMessage(messageId: string) {
  return useQuery({
    queryKey: queryKeys.smsApi.detail(messageId),
    queryFn: ({ signal }) =>
      apiGet(`/sms/${encodeURIComponent(messageId)}`, smsResourceSchema, {
        signal,
      }),
    enabled: Boolean(messageId),
    refetchInterval: (query) => {
      const status = query.state.data?.last_event;
      if (!status) return 4000;
      return isTerminalSmsStatus(status) ? false : 4000;
    },
  });
}

/**
 * `poll` is threaded in by the caller (message-detail.tsx) based on whether
 * the parent message is still in a non-terminal state — the events list has
 * no status field of its own to make that call independently.
 */
export function useSmsEvents(
  messageId: string,
  options: { poll?: boolean } = {},
) {
  const { poll = true } = options;
  return useQuery({
    queryKey: queryKeys.smsApi.events(messageId),
    queryFn: ({ signal }) =>
      apiGet(
        `/sms/${encodeURIComponent(messageId)}/events`,
        smsEventListSchema,
        { signal },
      ),
    enabled: Boolean(messageId),
    refetchInterval: poll ? 4000 : false,
  });
}

export function useSmsAnalytics() {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.smsApi.analytics(teamId),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet("/sms/analytics", smsAnalyticsSchema, { signal, teamId }),
    staleTime: 60_000,
  });
}

/**
 * POST /sms requires a unique Idempotency-Key header. We mint one per
 * mutation call so retries (e.g. React Query's own retry logic, or a user
 * double-clicking before the button disables) don't fan out into duplicate
 * sends.
 */
export function useSendSms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendSmsInput) =>
      apiMutate(
        "/sms",
        "POST",
        smsMutationEnvelopeSchema,
        sendSmsInputSchema.parse(input),
        { headers: { "Idempotency-Key": crypto.randomUUID() } },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.smsApi.lists(),
      });
    },
  });
}

/** Same idempotency-key reasoning as useSendSms, applied to the batch endpoint. */
export function useSendSmsBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendSmsBatchInput) =>
      apiMutate(
        "/sms/batch",
        "POST",
        smsBatchMutationListSchema,
        sendSmsBatchInputSchema.parse(input),
        { headers: { "Idempotency-Key": crypto.randomUUID() } },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.smsApi.lists(),
      });
    },
  });
}

export function useUpdateSmsSchedule(messageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduledAt: string) =>
      apiMutate(
        `/sms/${encodeURIComponent(messageId)}`,
        "PATCH",
        smsMutationEnvelopeSchema,
        updateSmsScheduleInputSchema.parse({
          scheduled_at: scheduledAt,
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.smsApi.detail(messageId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.smsApi.lists(),
      });
    },
  });
}

export function useCancelSms(messageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate(
        `/sms/${encodeURIComponent(messageId)}/cancel`,
        "POST",
        smsMutationEnvelopeSchema,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.smsApi.detail(messageId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.smsApi.lists(),
      });
    },
  });
}

export function useSyncSmsStatus(messageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate(
        `/sms/${encodeURIComponent(messageId)}/sync-status`,
        "POST",
        smsResourceSchema,
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.smsApi.detail(messageId), updated);
      queryClient.invalidateQueries({
        queryKey: queryKeys.smsApi.lists(),
      });
    },
  });
}
