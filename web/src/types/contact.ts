import { z } from "zod";

export const smsConsentStatusSchema = z.enum([
  "unknown",
  "opted_in",
  "opted_out",
]);
export type SmsConsentStatus = z.infer<typeof smsConsentStatusSchema>;

export const SMS_CONSENT_STATUS_LABEL: Record<SmsConsentStatus, string> = {
  unknown: "Unknown",
  opted_in: "Opted in",
  opted_out: "Opted out",
};

export const smsConsentSourceSchema = z.enum(["api", "import", "manual"]);
export type SmsConsentSource = z.infer<typeof smsConsentSourceSchema>;

export const SMS_CONSENT_SOURCE_LABEL: Record<SmsConsentSource, string> = {
  api: "API",
  import: "Import",
  manual: "Manual",
};

export const contactSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  email: z.email(),
  phone: z.string().nullish(),
  normalized_phone: z.string().nullish(),
  phone_country: z.string().nullish(),

  sms_consent_status: smsConsentStatusSchema.catch("unknown"),
  sms_consent_updated_at: z.string().nullish(),
  sms_consent_source: smsConsentSourceSchema.nullish(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  unsubscribed: z.boolean().catch(false),
  properties: z.record(z.string(), z.unknown()).catch({}),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Contact = z.infer<typeof contactSchema>;

export const contactsListSchema = z.array(contactSchema);

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createContactInputSchema = z.object({
  email: z.email("Enter a valid email address."),
  phone: optionalTrimmedString,
  sms_consent_status: smsConsentStatusSchema.optional(),
  // API requires sms_consent_source whenever an explicit consent status is
  // supplied — enforced in the form dialog, not here, since it depends on
  // the sibling field's value.
  sms_consent_source: smsConsentSourceSchema.optional(),
  first_name: optionalTrimmedString,
  last_name: optionalTrimmedString,
  unsubscribed: z.boolean().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});
export type CreateContactInput = z.infer<typeof createContactInputSchema>;

// PATCH accepts the same fields, all optional.
export const updateContactInputSchema = createContactInputSchema.partial();
export type UpdateContactInput = z.infer<typeof updateContactInputSchema>;

export type ContactListParams = {
  limit?: number;
  offset?: number;
};

export const CONTACTS_PAGE_SIZE = 50;

// ---------------------------------------------------------------------------
// Segment membership, as seen from a single contact
// GET/POST/DELETE /contacts/:id/segments[/:segment_id]
// ---------------------------------------------------------------------------

export const contactSegmentMembershipSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  name: z.string(),
  created_at: z.string(),
  assigned_at: z.string(),
});
export type ContactSegmentMembership = z.infer<
  typeof contactSegmentMembershipSchema
>;
export const contactSegmentsListSchema = z.array(
  contactSegmentMembershipSchema,
);

// DELETE /contacts/:id/segments/:segment_id returns 204 No Content.
export const contactSegmentRemovedSchema = z.void();

// ---------------------------------------------------------------------------
// Topics, as seen from a single contact — GET/PATCH /contacts/:id/topics
// Exposed as ready-to-use hooks; not yet surfaced in the Contacts UI below
// (a natural "Subscriptions" tab for a future contact detail view).

export const topicSubscriptionSchema = z.enum(["opt_in", "opt_out"]);
export type TopicSubscription = z.infer<typeof topicSubscriptionSchema>;

export const contactTopicSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  subscription: topicSubscriptionSchema,
});
export type ContactTopic = z.infer<typeof contactTopicSchema>;

export const contactTopicListSchema = z.object({
  object: z.literal("list"),
  has_more: z.boolean(),
  data: z.array(contactTopicSchema),
});

export const updateContactTopicsInputSchema = z.array(
  z.object({
    id: z.string(),
    subscription: topicSubscriptionSchema,
  }),
);
export type UpdateContactTopicsInput = z.infer<
  typeof updateContactTopicsInputSchema
>;

export const contactTopicUpdateResponseSchema = z.object({ id: z.string() });

export function computeContactName(contact: Contact): string {
  const name = [contact.first_name, contact.last_name]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ");
  return name || "—";
}
