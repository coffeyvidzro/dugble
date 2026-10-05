// src/lib/api/query-keys.ts

import type {
  SubscriptionChargesParams,
  WalletLedgerParams,
} from "@/types/billing-api";
import type { BroadcastListParams } from "@/types/broadcast-api";
import type { CampaignListParams } from "@/types/campaign-api";
import type { EmailListParams } from "@/types/email-api";
import type { SmsListParams } from "@/types/sms-api";
import type { TeamsQueryParams } from "@/types/team";
import type { TemplateListParams } from "@/types/template-api";

/** Team a cached resource belongs to (`null` = no team selected yet). */
export type TeamScope = string | null;

const ROOT = ["dugble"] as const;

/**
 * Query-key factory. Conventions:
 *
 * - Every key starts with `ROOT`, so `queryClient.clear()`/`removeQueries({ queryKey: ROOT })`
 *   reaches all Dugble data.
 * - Anything the API scopes by `X-Team-ID` and that is *not* addressed by a
 *   globally unique ID (lists, analytics, billing) carries the team in its key,
 *   so switching teams can never surface another team's cached data.
 * - `lists()` without a team is a prefix matching every team's lists — use it
 *   for invalidation after mutations.
 */
export const queryKeys = {
  all: ROOT,

  users: {
    all: () => [...ROOT, "users"] as const,
    me: () => [...queryKeys.users.all(), "me"] as const,
  },

  auth: {
    all: () => [...ROOT, "auth"] as const,
    mfa: () => [...queryKeys.auth.all(), "mfa"] as const,
    sessions: () => [...queryKeys.auth.all(), "sessions"] as const,
  },

  myInvitations: {
    all: () => [...ROOT, "my-invitations"] as const,
    list: () => [...queryKeys.myInvitations.all()] as const,
  },

  invitationByToken: (token: string) =>
    [...ROOT, "invitation-by-token", token] as const,

  teams: {
    all: () => [...ROOT, "teams"] as const,
    lists: () => [...queryKeys.teams.all(), "list"] as const,
    list: (params: TeamsQueryParams) =>
      [...queryKeys.teams.lists(), params] as const,
    details: () => [...queryKeys.teams.all(), "detail"] as const,
    detail: (teamId: string) => [...queryKeys.teams.details(), teamId] as const,
    members: (teamId: string) =>
      [...queryKeys.teams.detail(teamId), "members"] as const,
    invitations: (teamId: string) =>
      [...queryKeys.teams.detail(teamId), "invitations"] as const,
  },

  teamTokens: {
    all: () => [...ROOT, "team-tokens"] as const,
    lists: () => [...queryKeys.teamTokens.all(), "list"] as const,
    list: (teamId: TeamScope) =>
      [...queryKeys.teamTokens.lists(), teamId] as const,
  },

  webhooks: {
    all: () => [...ROOT, "webhooks"] as const,
    lists: () => [...queryKeys.webhooks.all(), "list"] as const,
    list: (teamId: TeamScope) =>
      [...queryKeys.webhooks.lists(), teamId] as const,
    detail: (id: string) =>
      [...queryKeys.webhooks.all(), "detail", id] as const,
  },

  contacts: {
    all: () => [...ROOT, "contacts"] as const,
    lists: () => [...queryKeys.contacts.all(), "list"] as const,
    list: (teamId: TeamScope, limit: number) =>
      [...queryKeys.contacts.lists(), teamId, { limit }] as const,
    detail: (contactId: string) =>
      [...queryKeys.contacts.all(), "detail", contactId] as const,
    segments: (contactId: string) =>
      [...queryKeys.contacts.detail(contactId), "segments"] as const,
    topics: (contactId: string) =>
      [...queryKeys.contacts.detail(contactId), "topics"] as const,
  },

  segments: {
    all: () => [...ROOT, "segments"] as const,
    lists: () => [...queryKeys.segments.all(), "list"] as const,
    list: (teamId: TeamScope) =>
      [...queryKeys.segments.lists(), teamId] as const,
    detail: (id: string) =>
      [...queryKeys.segments.all(), "detail", id] as const,
    audienceSize: (id: string) =>
      [...queryKeys.segments.all(), "audience-size", id] as const,
  },

  suppressions: {
    all: () => [...ROOT, "suppressions"] as const,
    lists: () => [...queryKeys.suppressions.all(), "list"] as const,
    list: (teamId: TeamScope) =>
      [...queryKeys.suppressions.lists(), teamId] as const,
    detail: (id: string) =>
      [...queryKeys.suppressions.all(), "detail", id] as const,
  },

  senderIds: {
    all: () => [...ROOT, "sender-ids"] as const,
    lists: () => [...queryKeys.senderIds.all(), "list"] as const,
    list: (teamId: TeamScope) =>
      [...queryKeys.senderIds.lists(), teamId] as const,
    detail: (senderId: string) =>
      [...queryKeys.senderIds.all(), "detail", senderId] as const,
  },

  senderDomainsApi: {
    all: () => [...ROOT, "sender-domains"] as const,
    lists: () => [...queryKeys.senderDomainsApi.all(), "list"] as const,
    list: (teamId: TeamScope) =>
      [...queryKeys.senderDomainsApi.lists(), teamId] as const,
    detail: (domainId: string) =>
      [...queryKeys.senderDomainsApi.all(), "detail", domainId] as const,
  },

  templatesApi: {
    all: () => [...ROOT, "templates"] as const,
    lists: () => [...queryKeys.templatesApi.all(), "list"] as const,
    list: (teamId: TeamScope, params: TemplateListParams) =>
      [...queryKeys.templatesApi.lists(), teamId, params] as const,
    detail: (templateId: string) =>
      [...queryKeys.templatesApi.all(), "detail", templateId] as const,
    versions: (templateId: string) =>
      [...queryKeys.templatesApi.detail(templateId), "versions"] as const,
    preview: (templateId: string) =>
      [...queryKeys.templatesApi.detail(templateId), "preview"] as const,
  },

  broadcastsApi: {
    all: () => [...ROOT, "broadcasts"] as const,
    lists: () => [...queryKeys.broadcastsApi.all(), "list"] as const,
    list: (teamId: TeamScope, params: BroadcastListParams) =>
      [...queryKeys.broadcastsApi.lists(), teamId, params] as const,
    detail: (broadcastId: string) =>
      [...queryKeys.broadcastsApi.all(), "detail", broadcastId] as const,
    recipients: (broadcastId: string) =>
      [...queryKeys.broadcastsApi.detail(broadcastId), "recipients"] as const,
    exclusions: (broadcastId: string) =>
      [...queryKeys.broadcastsApi.detail(broadcastId), "exclusions"] as const,
    analytics: (broadcastId: string) =>
      [...queryKeys.broadcastsApi.detail(broadcastId), "analytics"] as const,
  },

  campaignsApi: {
    all: () => [...ROOT, "campaigns"] as const,
    lists: () => [...queryKeys.campaignsApi.all(), "list"] as const,
    list: (teamId: TeamScope, params: CampaignListParams) =>
      [...queryKeys.campaignsApi.lists(), teamId, params] as const,
    detail: (campaignId: string) =>
      [...queryKeys.campaignsApi.all(), "detail", campaignId] as const,
    recipients: (campaignId: string) =>
      [...queryKeys.campaignsApi.detail(campaignId), "recipients"] as const,
    costEstimate: (campaignId: string) =>
      [...queryKeys.campaignsApi.detail(campaignId), "cost-estimate"] as const,
    exclusions: (campaignId: string) =>
      [...queryKeys.campaignsApi.detail(campaignId), "exclusions"] as const,
    analytics: (campaignId: string) =>
      [...queryKeys.campaignsApi.detail(campaignId), "analytics"] as const,
  },

  smsApi: {
    all: () => [...ROOT, "sms"] as const,
    lists: () => [...queryKeys.smsApi.all(), "list"] as const,
    list: (teamId: TeamScope, params: SmsListParams) =>
      [...queryKeys.smsApi.lists(), teamId, params] as const,
    detail: (messageId: string) =>
      [...queryKeys.smsApi.all(), "detail", messageId] as const,
    events: (messageId: string) =>
      [...queryKeys.smsApi.detail(messageId), "events"] as const,
    analyticsAll: () => [...queryKeys.smsApi.all(), "analytics"] as const,
    analytics: (teamId: TeamScope) =>
      [...queryKeys.smsApi.analyticsAll(), teamId] as const,
  },

  emailApi: {
    all: () => [...ROOT, "email"] as const,
    lists: () => [...queryKeys.emailApi.all(), "list"] as const,
    list: (teamId: TeamScope, params: EmailListParams) =>
      [...queryKeys.emailApi.lists(), teamId, params] as const,
    detail: (messageId: string) =>
      [...queryKeys.emailApi.all(), "detail", messageId] as const,
    events: (messageId: string) =>
      [...queryKeys.emailApi.detail(messageId), "events"] as const,
    analyticsAll: () => [...queryKeys.emailApi.all(), "analytics"] as const,
    analytics: (teamId: TeamScope) =>
      [...queryKeys.emailApi.analyticsAll(), teamId] as const,
  },

  billingApi: {
    all: () => [...ROOT, "billing"] as const,
    /** Every billing key for one team; omit the team to match all teams. */
    team: (teamId?: TeamScope) =>
      teamId === undefined
        ? queryKeys.billingApi.all()
        : ([...queryKeys.billingApi.all(), teamId] as const),
    plans: (teamId: TeamScope) =>
      [...queryKeys.billingApi.all(), teamId, "plans"] as const,
    subscription: (teamId: TeamScope) =>
      [...queryKeys.billingApi.all(), teamId, "subscription"] as const,
    subscriptionCharges: (
      teamId: TeamScope,
      params: SubscriptionChargesParams,
    ) =>
      [
        ...queryKeys.billingApi.all(),
        teamId,
        "subscription-charges",
        params,
      ] as const,
    wallet: (teamId: TeamScope) =>
      [...queryKeys.billingApi.all(), teamId, "wallet"] as const,
    walletLedger: (teamId: TeamScope, params: WalletLedgerParams) =>
      [...queryKeys.billingApi.all(), teamId, "wallet-ledger", params] as const,
  },
} as const;
