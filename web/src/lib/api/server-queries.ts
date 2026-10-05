// src/lib/api/server-queries.ts

import "server-only";

import type { QueryKey } from "@tanstack/react-query";
import type { z } from "zod";
import { endpoints, WALLET_LEDGER_FIRST_PAGE } from "@/lib/api/endpoints";
import { queryKeys, type TeamScope } from "@/lib/api/query-keys";
import { serverGet } from "@/lib/api/server";
import {
  planListSchema,
  subscriptionSchema,
  walletLedgerResponseSchema,
  walletSchema,
} from "@/types/billing-api";
import { emailAnalyticsSchema } from "@/types/email-api";
import { segmentsListSchema } from "@/types/segment";
import { senderDomainListSchema } from "@/types/sender-domain-api";
import { senderIdListSchema } from "@/types/sender-id";
import { smsAnalyticsSchema } from "@/types/sms-api";
import { webhookEndpointsListSchema } from "@/types/webhook";

/** A query the server can prefetch; `queryKey` MUST equal the client hook's key. */
export type ServerQuery = {
  queryKey: QueryKey;
  queryFn: () => Promise<unknown>;
};

function teamQuery<T>(
  queryKey: QueryKey,
  path: string,
  schema: z.ZodType<T>,
  teamId: TeamScope,
): ServerQuery {
  return {
    queryKey,
    queryFn: () => serverGet(path, schema, { teamId }),
  };
}

/** Server counterparts of the client hooks, keyed identically. */
export const serverQueries = {
  smsAnalytics: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.smsApi.analytics(teamId),
      "/sms/analytics",
      smsAnalyticsSchema,
      teamId,
    ),
  emailAnalytics: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.emailApi.analytics(teamId),
      "/emails/analytics",
      emailAnalyticsSchema,
      teamId,
    ),
  wallet: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.billingApi.wallet(teamId),
      "/wallet",
      walletSchema,
      teamId,
    ),
  walletLedgerFirstPage: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.billingApi.walletLedger(teamId, WALLET_LEDGER_FIRST_PAGE),
      endpoints.walletLedger(WALLET_LEDGER_FIRST_PAGE),
      walletLedgerResponseSchema,
      teamId,
    ),
  plans: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.billingApi.plans(teamId),
      "/plans",
      planListSchema,
      teamId,
    ),
  subscription: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.billingApi.subscription(teamId),
      "/subscription",
      subscriptionSchema,
      teamId,
    ),
  webhooks: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.webhooks.list(teamId),
      "/webhook-endpoints",
      webhookEndpointsListSchema,
      teamId,
    ),
  senderIds: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.senderIds.list(teamId),
      "/sender-ids",
      senderIdListSchema,
      teamId,
    ),
  senderDomains: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.senderDomainsApi.list(teamId),
      "/domains",
      senderDomainListSchema,
      teamId,
    ),
  segments: (teamId: TeamScope) =>
    teamQuery(
      queryKeys.segments.list(teamId),
      "/segments",
      segmentsListSchema,
      teamId,
    ),
} as const;

export type ServerQueryName = keyof typeof serverQueries;
