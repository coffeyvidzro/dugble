// src/types/campaign-api.ts

import { z } from "zod";

export const campaignSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  name: z.string(),
  status: z.string(),
  segment_id: z.string(),
  sender_id: z.string(),
  body: z.string(),
  scheduled_at: z.string().nullish(),
  queued_at: z.string().nullish(),
  canceled_at: z.string().nullish(),
  materialized_at: z.string().nullish(),
  sent_at: z.string().nullish(),
  audience_count: z.number(),
  eligible_count: z.number(),
  excluded_count: z.number(),
  failed_count: z.number(),
  estimated_segments: z.number(),
  estimated_cost_units: z.number(),
  estimated_billable_cost_units: z.number(),
  preflight_allowance_segments: z.number(),
  actual_segments: z.number(),
  actual_charge_units: z.number(),
  // The documented response always includes `currency`, but real
  // responses omit it entirely until the campaign has an actual charge
  // (e.g. still `draft`). Treat as optional rather than required.
  currency: z.string().optional(),
  preflight_balance_units: z.number().optional(),
  preflight_at: z.string().nullish(),
  rate_limit_per_second: z.number(),
  // Same story as `currency` — omitted on fresh drafts rather than sent
  // as 0/null, despite the docs implying it's always present.
  daily_send_limit: z.number().optional(),
  revision: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Campaign = z.infer<typeof campaignSchema>;

export const campaignListSchema = z.array(campaignSchema);

export const createCampaignInputSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required."),
  segment_id: z.string().min(1, "Choose a segment to send to."),
  sender_id: z.string().min(1, "Choose a sender ID."),
  body: z.string().trim().min(1, "Write a message before continuing."),
  rate_limit_per_second: z.number().int().positive().optional(),
  daily_send_limit: z.number().int().positive().optional(),
});
export type CreateCampaignInput = z.infer<typeof createCampaignInputSchema>;

// Not yet surfaced in the UI — kept ready for an "edit draft" feature,
// since PATCH /campaigns/:campaign is a documented endpoint.
export const updateCampaignInputSchema = z.object({
  revision: z.number(),
  name: z.string().trim().min(1).optional(),
  segment_id: z.string().optional(),
  sender_id: z.string().optional(),
  body: z.string().trim().min(1).optional(),
  rate_limit_per_second: z.number().int().positive().optional(),
  daily_send_limit: z.number().int().positive().optional(),
});
export type UpdateCampaignInput = z.infer<typeof updateCampaignInputSchema>;

export const duplicateCampaignInputSchema = z.object({
  name: z.string().optional(),
});
export type DuplicateCampaignInput = z.infer<
  typeof duplicateCampaignInputSchema
>;

export const sendCampaignInputSchema = z.object({
  scheduled_at: z.string().optional(),
});
export type SendCampaignInput = z.infer<typeof sendCampaignInputSchema>;

export const scheduleCampaignInputSchema = z.object({
  scheduled_at: z.string(),
});
export type ScheduleCampaignInput = z.infer<typeof scheduleCampaignInputSchema>;

export const campaignPreviewSchema = z.string();

export const campaignRecipientSchema = z.object({
  id: z.string(),
  campaign_id: z.string(),
  contact_id: z.string().nullish(),
  phone: z.string().nullish(),
  phone_country: z.string().nullish(),
  contact_snapshot: z.record(z.string(), z.unknown()).optional(),
  status: z.string(),
  exclusion_reason: z.string().nullish(),
  sms_message_id: z.string().nullish(),
  created_at: z.string(),
  queued_at: z.string().nullish(),
  rendered_body: z.string().nullish(),
  attempt_count: z.number().nullish(),
  failure_code: z.string().nullish(),
  failure_message: z.string().nullish(),
  encoding: z.string().nullish(),
  estimated_segments: z.number().nullish(),
  estimated_unit_cost_units: z.number().nullish(),
  estimated_cost_units: z.number().nullish(),
  actual_segments: z.number().nullish(),
  actual_charge_units: z.number().nullish(),
});
export type CampaignRecipient = z.infer<typeof campaignRecipientSchema>;
export const campaignRecipientListSchema = z.array(campaignRecipientSchema);

export const campaignCostEstimateSchema = z.object({
  campaign_id: z.string(),
  currency: z.string(),
  recipients: z.number(),
  estimated_segments: z.number(),
  estimated_cost_units: z.number(),
  estimated_billable_cost_units: z.number(),
  preflight_allowance_segments: z.number(),
  minimum_recipient_cost_units: z.number(),
  maximum_recipient_cost_units: z.number(),
  actual_segments: z.number(),
  actual_charge_units: z.number(),
  preflight_balance_units: z.number(),
  preflight_at: z.string().nullish(),
});
export type CampaignCostEstimate = z.infer<typeof campaignCostEstimateSchema>;

const exclusionReasonsSchema = z
  .union([z.record(z.string(), z.number()), z.number()])
  .transform((value) => (typeof value === "number" ? {} : value));

export const campaignExclusionsSchema = z.object({
  campaign_id: z.string(),
  total: z.number(),
  reasons: exclusionReasonsSchema,
});
export type CampaignExclusions = z.infer<typeof campaignExclusionsSchema>;

export const campaignAnalyticsSchema = z.object({
  campaign_id: z.string(),
  audience: z.number(),
  eligible: z.number(),
  excluded: z.number(),
  queued: z.number(),
  failed: z.number(),
  sent: z.number(),
  delivered: z.number(),
  delivery_failed: z.number(),
  estimated_segments: z.number(),
  estimated_cost_units: z.number(),
  estimated_billable_cost_units: z.number(),
  actual_segments: z.number(),
  actual_charge_units: z.number(),
});
export type CampaignAnalytics = z.infer<typeof campaignAnalyticsSchema>;

export type CampaignListParams = {
  limit?: number;
  offset?: number;
};

export type KnownCampaignStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "sending"
  | "completed"
  | "failed"
  | "canceled";

const KNOWN_CAMPAIGN_STATUS_LABEL: Record<KnownCampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  queued: "Queued",
  sending: "Sending",
  completed: "Completed",
  failed: "Failed",
  canceled: "Canceled",
};

export function campaignStatusLabel(status: string): string {
  if (status in KNOWN_CAMPAIGN_STATUS_LABEL) {
    return KNOWN_CAMPAIGN_STATUS_LABEL[status as KnownCampaignStatus];
  }
  return status.length > 0
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : status;
}

export type CampaignFilter =
  | "all"
  | "draft"
  | "scheduled"
  | "sending"
  | "completed";

export const CAMPAIGN_FILTER_LABEL: Record<CampaignFilter, string> = {
  all: "All",
  draft: "Draft",
  scheduled: "Scheduled",
  sending: "Sending",
  completed: "Completed",
};

const FILTER_STATUSES: Record<CampaignFilter, string[] | null> = {
  all: null,
  draft: ["draft"],
  scheduled: ["scheduled"],
  sending: ["queued", "sending"],
  completed: ["completed", "failed", "canceled"],
};

export function matchesCampaignFilter(
  status: string,
  filter: CampaignFilter,
): boolean {
  const statuses = FILTER_STATUSES[filter];
  return statuses === null || statuses.includes(status);
}
