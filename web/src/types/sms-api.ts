import { z } from "zod";

export const smsStatusSchema = z.enum([
  "queued",
  "processing",
  "submitted",
  "sent",
  "delivered",
  "undelivered",
  "rejected",
  "failed",
  "expired",
  "unknown",
  "canceled",
]);
export type SmsApiStatus = z.infer<typeof smsStatusSchema>;

export const SMS_API_STATUS_LABEL: Record<SmsApiStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  submitted: "Submitted",
  sent: "Sent",
  delivered: "Delivered",
  undelivered: "Undelivered",
  rejected: "Rejected",
  failed: "Failed",
  expired: "Expired",
  unknown: "Unknown",
  canceled: "Canceled",
};

export const SMS_TERMINAL_STATUSES: SmsApiStatus[] = [
  "delivered",
  "undelivered",
  "rejected",
  "failed",
  "expired",
  "canceled",
];

export function isTerminalSmsStatus(status: SmsApiStatus): boolean {
  return SMS_TERMINAL_STATUSES.includes(status);
}

export const smsFailureSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const smsResourceSchema = z.object({
  object: z.literal("sms"),
  id: z.string(),
  message_id: z.string().nullish(),
  to: z.string(),
  from: z.string(),
  body: z.string(),
  last_event: smsStatusSchema,
  destination: z.object({ country: z.string().optional() }),
  segments: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  scheduled_at: z.string().nullish(),
  failure: smsFailureSchema.optional(),
  submitted_at: z.string().nullish(),
  delivered_at: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SmsApiResource = z.infer<typeof smsResourceSchema>;

export const smsListSchema = z.array(smsResourceSchema);

export const sendSmsInputSchema = z.object({
  to: z
    .string()
    .regex(/^\+[1-9]\d{6,14}$/, "Enter a valid international phone number."),
  from: z
    .string()
    .trim()
    .min(1)
    .max(11, "Sender ID can be at most 11 characters."),
  body: z.string().trim().min(1, "Enter a message.").max(1600),
  metadata: z.record(z.string(), z.unknown()).optional(),
  scheduled_at: z.string().optional(),
});
export type SendSmsInput = z.infer<typeof sendSmsInputSchema>;

export const sendSmsBatchInputSchema = z
  .array(sendSmsInputSchema)
  .min(1)
  .max(50);
export type SendSmsBatchInput = z.infer<typeof sendSmsBatchInputSchema>;

export const updateSmsScheduleInputSchema = z.object({
  scheduled_at: z.string(),
});

export const smsMutationEnvelopeSchema = z.object({
  object: z.string(),
  id: z.string(),
});

export const smsBatchMutationListSchema = z.array(smsMutationEnvelopeSchema);

export const smsDeliveryEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  occurred_at: z.string(),
  provider: z.string().optional(),
  code: z.string().optional(),
  message: z.string().optional(),
});
export type SmsDeliveryEvent = z.infer<typeof smsDeliveryEventSchema>;

export const smsEventListSchema = z.object({
  object: z.literal("list"),
  data: z.array(smsDeliveryEventSchema),
});

export const smsAnalyticsWindowSchema = z.object({
  days: z.number(),
  rates: z.array(z.object({ name: z.string(), value: z.number() })),
  series: z.array(
    z.object({
      date: z.string(),
      total: z.number(),
      delivered: z.number(),
      failed: z.number(),
    }),
  ),
});

export type SmsAnalyticsWindow = z.infer<typeof smsAnalyticsWindowSchema>;

export const smsCountryAnalyticsSchema = z.object({
  country: z.string(),
  total: z.number(),
  delivered: z.number(),
  failed: z.number(),
});

export const smsAnalyticsSchema = z.object({
  object: z.literal("sms.analytics"),
  windows: z.array(smsAnalyticsWindowSchema),
  delivery_by_country: z.array(smsCountryAnalyticsSchema),
});
export type SmsAnalytics = z.infer<typeof smsAnalyticsSchema>;

export type SmsListParams = {
  limit?: number;
  offset?: number;
  status?: SmsApiStatus;
  sender?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
};
