// src/types/sender-id.ts

import { z } from "zod";

export const senderIdStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "suspended",
  "inactive",
]);
export type SenderIdStatus = z.infer<typeof senderIdStatusSchema>;

export const SENDER_ID_STATUS_LABEL: Record<SenderIdStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  inactive: "Inactive",
};

export const senderIdSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  name: z.string(),
  country_code: z.string(),
  purpose: z.string(),
  status: senderIdStatusSchema,
  rejection_reason: z.string().nullish(),
  approved_at: z.string().nullish(),
  rejected_at: z.string().nullish(),
  suspended_at: z.string().nullish(),
  created_by: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SenderId = z.infer<typeof senderIdSchema>;

export const senderIdListSchema = z.array(senderIdSchema);

// NOTE: `provider` is intentionally NOT included here. It is accepted by the
// API but must not be sent from this dashboard — we don't expose provider
// selection to customers.
export const createSenderIdInputSchema = z.object({
  name: z.string().trim().min(1, "Sender ID is required."),
  country_code: z.string().trim().length(2, "Select a country.").toUpperCase(),
  purpose: z
    .string()
    .trim()
    .min(1, "Describe what you'll use this sender ID for.")
    .max(500, "Keep it under 500 characters."),
});
export type CreateSenderIdInput = z.infer<typeof createSenderIdInputSchema>;

export const SENDER_ID_COUNTRIES: {
  code: string;
  name: string;
  flag: string;
}[] = [
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
];

export function computeSenderIdStats(senderIds: SenderId[]): {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
} {
  return {
    total: senderIds.length,
    approved: senderIds.filter((s) => s.status === "approved").length,
    pending: senderIds.filter((s) => s.status === "pending").length,
    rejected: senderIds.filter((s) => s.status === "rejected").length,
  };
}

export type SenderIdFilter = "all" | "approved" | "pending" | "rejected";

export const SENDER_ID_FILTER_LABEL: Record<SenderIdFilter, string> = {
  all: "All",
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

export function matchesSenderIdFilter(
  status: SenderIdStatus,
  filter: SenderIdFilter,
): boolean {
  if (filter === "all") return true;
  return status === filter;
}
