"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { keepPreviousTeamData } from "@/lib/api/team-placeholder";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type EmailListParams,
  emailAnalyticsSchema,
  emailEventListSchema,
  emailMutationEnvelopeSchema,
  emailResourceSchema,
  emailSummaryListSchema,
  type SendEmailInput,
  sendEmailInputSchema,
  updateEmailScheduleInputSchema,
} from "@/types/email-api";

function buildEmailQuery(params: EmailListParams): string {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  return qs ? `/emails?${qs}` : "/emails";
}

export function useEmails(params: EmailListParams = { limit: 25 }) {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.emailApi.list(teamId, params),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet(buildEmailQuery(params), emailSummaryListSchema, {
        signal,
        teamId,
      }),
    placeholderData: keepPreviousTeamData(teamId),
    staleTime: 10_000,
  });
}

export function useEmail(messageId: string) {
  return useQuery({
    queryKey: queryKeys.emailApi.detail(messageId),
    queryFn: ({ signal }) =>
      apiGet(`/emails/${encodeURIComponent(messageId)}`, emailResourceSchema, {
        signal,
      }),
    enabled: Boolean(messageId),
  });
}

export function useEmailEvents(messageId: string) {
  return useQuery({
    queryKey: queryKeys.emailApi.events(messageId),
    queryFn: ({ signal }) =>
      apiGet(
        `/emails/${encodeURIComponent(messageId)}/events`,
        emailEventListSchema,
        { signal },
      ),
    enabled: Boolean(messageId),
  });
}

export function useEmailAnalytics() {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.emailApi.analytics(teamId),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet("/emails/analytics", emailAnalyticsSchema, { signal, teamId }),
    staleTime: 60_000,
  });
}

export function useSendEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SendEmailInput) =>
      apiMutate(
        "/emails",
        "POST",
        emailMutationEnvelopeSchema,
        sendEmailInputSchema.parse(input),
        { headers: { "Idempotency-Key": crypto.randomUUID() } },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailApi.lists() });
    },
  });
}

export function useUpdateEmailSchedule(messageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduledAt: string) =>
      apiMutate(
        `/emails/${encodeURIComponent(messageId)}`,
        "PATCH",
        emailMutationEnvelopeSchema,
        updateEmailScheduleInputSchema.parse({ scheduled_at: scheduledAt }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailApi.detail(messageId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.emailApi.lists() });
    },
  });
}

export function useCancelEmail(messageId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate(
        `/emails/${encodeURIComponent(messageId)}/cancel`,
        "POST",
        emailMutationEnvelopeSchema,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.emailApi.detail(messageId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.emailApi.lists() });
    },
  });
}
