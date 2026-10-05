// src/types/email-api.ts

import { z } from "zod";

export const emailApiStatusSchema = z.enum([
  "queued",
  "processing",
  "submitted",
  "delivered",
  "delayed",
  "bounced",
  "complained",
  "rejected",
  "failed",
  "canceled",
]);
export type EmailApiStatus = z.infer<typeof emailApiStatusSchema>;

export const EMAIL_API_STATUS_LABEL: Record<EmailApiStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  submitted: "Submitted",
  delivered: "Delivered",
  delayed: "Delayed",
  bounced: "Bounced",
  complained: "Complained",
  rejected: "Rejected",
  failed: "Failed",
  canceled: "Canceled",
};

export const emailAddressObjectSchema = z.object({
  email: z.email(),
  name: z.string().optional(),
});
export type EmailAddressObject = z.infer<typeof emailAddressObjectSchema>;

export const emailAddressSchema = z.union([
  z.string(),
  emailAddressObjectSchema,
]);
export const emailAddressOrListSchema = z.union([
  emailAddressSchema,
  z.array(emailAddressSchema),
]);

export const emailSummarySchema = z.object({
  id: z.string(),
  to_email: z.email(),
  to_name: z.string().optional(),
  subject: z.string(),
  status: z.string(),
  provider: z.string().optional(),
  queued_at: z.string().optional(),
  submitted_at: z.string().optional(),
  delivered_at: z.string().optional(),
  created_at: z.string(),
});
export type EmailSummary = z.infer<typeof emailSummarySchema>;

export const emailSummaryListSchema = z.array(emailSummarySchema);

export const emailResourceSchema = z.object({
  object: z.literal("email"),
  id: z.string(),
  message_id: z.string().nullish(),
  to: z.array(z.string()),
  from: z.string(),
  created_at: z.string(),
  subject: z.string(),
  html: z.string().nullish(),
  text: z.string().nullish(),
  bcc: z.array(z.string()).optional(),
  cc: z.array(z.string()).optional(),
  reply_to: z.array(z.string()).optional(),
  last_event: emailApiStatusSchema,
  scheduled_at: z.string().nullish(),
  tags: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
});
export type EmailApiResource = z.infer<typeof emailResourceSchema>;

const attachmentSchema = z.object({
  content: z.string().optional(),
  filename: z.string(),
  content_type: z.string().optional(),
  content_id: z.string().optional(),
});

export const sendEmailInputSchema = z
  .object({
    from: emailAddressSchema.optional(),
    to: emailAddressOrListSchema,
    cc: emailAddressOrListSchema.optional(),
    bcc: emailAddressOrListSchema.optional(),
    reply_to: emailAddressOrListSchema.optional(),
    subject: z.string().trim().min(1).max(255),
    html: z.string().max(1_048_576).optional(),
    text: z.string().max(1_048_576).optional(),
    headers: z.record(z.string(), z.string()).optional(),
    attachments: z.array(attachmentSchema).optional(),
    tags: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
    scheduled_at: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => Boolean(value.html) || Boolean(value.text), {
    message: "Provide either HTML or plain-text content.",
    path: ["html"],
  });
export type SendEmailInput = z.infer<typeof sendEmailInputSchema>;

export const updateEmailScheduleInputSchema = z.object({
  scheduled_at: z.string(),
});

export const emailMutationEnvelopeSchema = z.object({
  object: z.string(),
  id: z.string(),
});

export const emailDeliveryEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  occurred_at: z.string(),
  provider: z.string().optional(),
  code: z.string().optional(),
  message: z.string().optional(),
});
export type EmailDeliveryEvent = z.infer<typeof emailDeliveryEventSchema>;

export const emailEventListSchema = z.object({
  object: z.literal("list"),
  data: z.array(emailDeliveryEventSchema),
});

export const emailAnalyticsWindowSchema = z.object({
  days: z.number(),
  rates: z.array(z.object({ name: z.string(), value: z.number() })),
  series: z.array(
    z.object({
      date: z.string(),
      total: z.number(),
      delivered: z.number(),
      opened: z.number(),
      clicked: z.number(),
      bounced: z.number(),
    }),
  ),
});

export type EmailAnalyticsWindow = z.infer<typeof emailAnalyticsWindowSchema>;

export const emailAnalyticsSchema = z.object({
  object: z.literal("email.analytics"),
  windows: z.array(emailAnalyticsWindowSchema),
});
export type EmailAnalytics = z.infer<typeof emailAnalyticsSchema>;

export type EmailListParams = {
  limit?: number;
  offset?: number;
};

// Statuses that won't change again without an explicit reschedule/cancel —
// used to decide when it's safe to stop polling an email or its events.
export const EMAIL_TERMINAL_STATUSES: EmailApiStatus[] = [
  "delivered",
  "bounced",
  "complained",
  "rejected",
  "failed",
  "canceled",
];

export function isTerminalEmailStatus(status: EmailApiStatus): boolean {
  return EMAIL_TERMINAL_STATUSES.includes(status);
}
