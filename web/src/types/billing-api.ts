import { z } from "zod";
import { httpsUrlSchema } from "@/lib/security/safe-url";

export type PlanCode = "growth" | "scale" | "enterprise";

export const planPriceSchema = z.object({
  id: z.string(),
  currency: z.string(),
  amount_units: z.number(),
});
export type PlanPrice = z.infer<typeof planPriceSchema>;

export const planSchema = z.object({
  code: z.string(),
  name: z.string(),

  price: planPriceSchema.optional(),
  available: z.boolean(),
  current: z.boolean(),
  pending: z.boolean(),
  effective_at: z.string().nullish(),
});
export type Plan = z.infer<typeof planSchema>;

export const planListSchema = z.array(planSchema);

export const subscriptionSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  plan_code: z.string(),
  status: z.string(),
  current_period_start: z.string(),
  current_period_end: z.string(),
  pending_plan_code: z.string().nullish(),
  pending_plan_effective_at: z.string().nullish(),
  cancel_at_period_end: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Subscription = z.infer<typeof subscriptionSchema>;

export const changePlanInputSchema = z.object({
  plan: z.string().trim().min(1, "Choose a plan."),
});
export type ChangePlanInput = z.infer<typeof changePlanInputSchema>;

export const communicationCreditSchema = z.object({
  id: z.string(),
  granted_units: z.number(),
  consumed_units: z.number(),
  remaining_units: z.number(),
});

export const subscriptionChargeSchema = z.object({
  id: z.string(),
  subscription_id: z.string(),
  plan_price_id: z.string(),
  plan_code: z.string(),
  billing_market: z.string(),
  currency: z.string(),
  period_start: z.string(),
  period_end: z.string(),
  amount_units: z.number(),
  status: z.string(),
  attempt_count: z.number(),
  last_attempted_at: z.string().nullish(),
  applied_at: z.string().nullish(),
  failure_code: z.string().nullish(),
  reference_id: z.string(),
  communication_credit: communicationCreditSchema.optional(),
  created_at: z.string(),
});
export type SubscriptionCharge = z.infer<typeof subscriptionChargeSchema>;

export const subscriptionChargesResponseSchema = z.object({
  charges: z.array(subscriptionChargeSchema),
  limit: z.number(),
  offset: z.number(),
});

export type SubscriptionChargesParams = { limit?: number; offset?: number };

export const walletSchema = z.object({
  team_id: z.string(),
  currency: z.string(),
  balance_units: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Wallet = z.infer<typeof walletSchema>;

export const walletLedgerEntrySchema = z.object({
  id: z.string(),
  team_id: z.string(),
  usage_authorization_id: z.string().nullish(),
  subscription_charge_id: z.string().nullish(),
  amount_units: z.number(),
  transaction_type: z.string(),
  reference_id: z.string().nullish(),
  created_at: z.string(),
});
export type WalletLedgerEntry = z.infer<typeof walletLedgerEntrySchema>;

export const walletLedgerResponseSchema = z.object({
  entries: z.array(walletLedgerEntrySchema),
  limit: z.number(),
  offset: z.number(),
});

export type WalletLedgerParams = { limit?: number; offset?: number };

export const topUpInputSchema = z.object({
  amount_units: z.number().int().positive(),
  description: z.string().trim().max(500).optional(),
});
export type TopUpInput = z.infer<typeof topUpInputSchema>;

export const topUpResponseSchema = z.object({
  transaction_id: z.string(),
  client_reference: z.string(),
  checkout_id: z.string(),

  checkout_url: httpsUrlSchema,
  checkout_direct_url: httpsUrlSchema,
});
export type TopUpResponse = z.infer<typeof topUpResponseSchema>;
