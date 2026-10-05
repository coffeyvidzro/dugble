import { z } from "zod";

export const broadcastStatusSchema = z.enum([
  "draft",
  "scheduled",
  "queued",
  "sent",
  "failed",
  "canceled",
]);
export type BroadcastStatus = z.infer<typeof broadcastStatusSchema>;

export const BROADCAST_STATUS_LABEL: Record<BroadcastStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  queued: "Queued",
  sent: "Sent",
  failed: "Failed",
  canceled: "Canceled",
};

export const broadcastSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  name: z.string(),
  status: broadcastStatusSchema,
  segment_id: z.string(),
  topic_id: z.string().nullish(),
  from_email: z.email().nullish(),
  from_name: z.string().nullish(),
  reply_to_email: z.email().nullish(),
  subject: z.string(),
  preview_text: z.string().nullish(),
  html: z.string(),
  text: z.string().nullish(),
  variable_bindings: z.record(z.string(), z.unknown()).default({}),
  scheduled_at: z.string().nullish(),
  queued_at: z.string().nullish(),
  sent_at: z.string().nullish(),
  canceled_at: z.string().nullish(),
  audience_count: z.number(),
  eligible_count: z.number(),
  suppressed_count: z.number(),
  queued_count: z.number(),
  failed_count: z.number(),
  revision: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Broadcast = z.infer<typeof broadcastSchema>;

export const broadcastListSchema = z.array(broadcastSchema);

export const createBroadcastInputSchema = z.object({
  name: z.string().trim().min(1, "Broadcast name is required."),
  segment_id: z.string().min(1, "Choose a segment to send to."),
  topic_id: z.string().nullish(),
  from_email: z.email().nullish(),
  from_name: z.string().nullish(),
  reply_to_email: z.email().nullish(),
  subject: z.string().trim().min(1, "Give your broadcast a subject line."),
  preview_text: z.string().nullish(),
  html: z.string().min(1, "Write some content before sending."),
  text: z.string().nullish(),
  variable_bindings: z.record(z.string(), z.unknown()).optional(),
  send: z.boolean().optional(),
  scheduled_at: z.string().nullish(),
});
export type CreateBroadcastInput = z.infer<typeof createBroadcastInputSchema>;

export const updateBroadcastInputSchema = z.object({
  revision: z.number(),
  name: z.string().trim().min(1).optional(),
  segment_id: z.string().optional(),
  topic_id: z.string().nullish(),
  from_email: z.email().nullish(),
  from_name: z.string().nullish(),
  reply_to_email: z.email().nullish(),
  subject: z.string().trim().min(1).optional(),
  preview_text: z.string().nullish(),
  html: z.string().min(1).optional(),
  text: z.string().nullish(),
  variable_bindings: z.record(z.string(), z.unknown()).nullish(),
});
export type UpdateBroadcastInput = z.infer<typeof updateBroadcastInputSchema>;

export const sendBroadcastInputSchema = z.object({
  scheduled_at: z.string().optional(),
});
export type SendBroadcastInput = z.infer<typeof sendBroadcastInputSchema>;

export const duplicateBroadcastInputSchema = z.object({
  name: z.string().optional(),
});
export type DuplicateBroadcastInput = z.infer<
  typeof duplicateBroadcastInputSchema
>;

export const broadcastPreviewSchema = z.object({
  from_email: z.email().optional(),
  from_name: z.string().optional(),
  reply_to_email: z.email().optional(),
  subject: z.string(),
  preview_text: z.string().optional(),
  html: z.string(),
  text: z.string().optional(),
});
export type BroadcastPreview = z.infer<typeof broadcastPreviewSchema>;

export const broadcastPreviewInputSchema = z.object({
  variables: z.record(z.string(), z.unknown()).optional(),
});
export type BroadcastPreviewInput = z.infer<typeof broadcastPreviewInputSchema>;

export const broadcastRecipientSchema = z.object({
  id: z.string(),
  broadcast_id: z.string(),
  contact_id: z.string().optional(),
  email: z.email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  status: z.string(),
  exclusion_reason: z.string().optional(),
  email_message_id: z.string().optional(),
  created_at: z.string(),
  queued_at: z.string().optional(),
});
export type BroadcastRecipient = z.infer<typeof broadcastRecipientSchema>;

export const broadcastRecipientListSchema = z.array(broadcastRecipientSchema);

export const broadcastExclusionSummarySchema = z.object({
  object: z.string(),
  broadcast_id: z.string(),
  total: z.number(),
  reasons: z.record(z.string(), z.number()),
});
export type BroadcastExclusionSummary = z.infer<
  typeof broadcastExclusionSummarySchema
>;

export const broadcastAnalyticsSchema = z.object({
  object: z.string(),
  broadcast_id: z.string(),
  audience: z.number(),
  eligible: z.number(),
  excluded: z.number(),
  queued: z.number(),
  delivered: z.number(),
  bounced: z.number(),
  complained: z.number(),
  failed: z.number(),
  opened: z.number(),
  clicked: z.number(),
});
export type BroadcastAnalytics = z.infer<typeof broadcastAnalyticsSchema>;

export type BroadcastListParams = {
  limit?: number;
  offset?: number;
};
