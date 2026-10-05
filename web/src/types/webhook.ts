import { z } from "zod";

export const webhookEndpointSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  url: z.string(),
  enabled: z.boolean(),
  subscribed_events: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
  disabled_at: z.string().nullish(),
  consecutive_failures: z.number(),
  last_failure_at: z.string().nullish(),
  disabled_reason: z.string().nullish(),
});
export type WebhookEndpoint = z.infer<typeof webhookEndpointSchema>;

export const webhookEndpointsListSchema = z.array(webhookEndpointSchema);

const webhookUrlSchema = z
  .string()
  .trim()
  .min(1, "Endpoint URL is required.")
  .url("Enter a valid URL.")
  .refine((url) => url.startsWith("https://"), {
    message: "Endpoint URL must use https://.",
  });

export const createWebhookEndpointInputSchema = z.object({
  url: webhookUrlSchema,
  subscribed_events: z.array(z.string()).min(1, "Select at least one event."),
});
export type CreateWebhookEndpointInput = z.infer<
  typeof createWebhookEndpointInputSchema
>;

export const createdWebhookEndpointSchema = webhookEndpointSchema.extend({
  signing_secret: z.string(),
});
export type CreatedWebhookEndpoint = z.infer<
  typeof createdWebhookEndpointSchema
>;

export const webhookSecretOnlySchema = z.object({
  signing_secret: z.string(),
});
export type WebhookSecretOnly = z.infer<typeof webhookSecretOnlySchema>;

export const updateWebhookEndpointInputSchema = z.object({
  url: webhookUrlSchema.optional(),
  enabled: z.boolean().optional(),
  subscribed_events: z.array(z.string()).min(1).optional(),
});
export type UpdateWebhookEndpointInput = z.infer<
  typeof updateWebhookEndpointInputSchema
>;

export const rotateWebhookSecretResponseSchema = z.object({
  signing_secret: z.string(),
});

export const webhookEndpointDeletedSchema = z.void();

export const webhookDeliverySchema = z.object({
  id: z.string(),
  event_id: z.string(),
  endpoint_id: z.string(),
  status: z.string(),
  attempt_count: z.number(),
  next_attempt_at: z.string().nullish(),
  last_attempt_at: z.string().nullish(),
  response_status: z.number().nullish(),
  response_body: z.string().nullish(),
  last_error: z.string().nullish(),
  delivered_at: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type WebhookDelivery = z.infer<typeof webhookDeliverySchema>;
