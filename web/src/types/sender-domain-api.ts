// src/types/sender-domain-api.ts

import { z } from "zod";

export const domainRegionSchema = z.enum(["us-east-1", "eu-north-1"]);
export type DomainRegion = z.infer<typeof domainRegionSchema>;

export const domainTlsSchema = z.enum(["opportunistic", "enforced"]);
export type DomainTls = z.infer<typeof domainTlsSchema>;

export const domainStatusSchema = z.enum([
  "not_started",
  "pending",
  "verified",
  "partially_verified",
  "partially_failed",
  "failed",
  "temporary_failure",
  "disabled",
]);
export type DomainStatus = z.infer<typeof domainStatusSchema>;

export const domainHealthStatusSchema = z.enum([
  "unknown",
  "healthy",
  "degraded",
]);
export type DomainHealthStatus = z.infer<typeof domainHealthStatusSchema>;

export const verificationRecordStatusSchema = z.enum([
  "pending",
  "verified",
  "failed",
]);
export type VerificationRecordStatus = z.infer<
  typeof verificationRecordStatusSchema
>;

export const verificationRecordSchema = z.object({
  record: z.enum(["DKIM", "SPF"]),
  name: z.string(),
  value: z.string(),
  type: z.enum(["TXT", "MX"]),
  status: verificationRecordStatusSchema,
  ttl: z.string(),
  priority: z.number().optional(),
});
export type VerificationRecord = z.infer<typeof verificationRecordSchema>;

export const senderDomainSchema = z.object({
  id: z.string(),
  team_id: z.string(),
  name: z.string(),
  region: domainRegionSchema,
  provider_external_id: z.string().nullish(),
  status: domainStatusSchema,
  provider_status: z.string().nullish(),
  records: z.array(verificationRecordSchema).default([]),
  tls: domainTlsSchema,
  failure_reason: z.string().nullish(),
  health_status: domainHealthStatusSchema,
  consecutive_health_failures: z.number().default(0),
  last_checked_at: z.string().nullish(),
  last_health_checked_at: z.string().nullish(),
  last_health_failure_at: z.string().nullish(),
  verified_at: z.string().nullish(),
  disabled_at: z.string().nullish(),
  created_by: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type SenderDomain = z.infer<typeof senderDomainSchema>;

export const senderDomainListSchema = z.array(senderDomainSchema);

export const createDomainInputSchema = z.object({
  name: z.string().trim().min(1, "Enter a domain.").max(253),
  region: domainRegionSchema,
  tls: domainTlsSchema.optional(),
});
export type CreateDomainInput = z.infer<typeof createDomainInputSchema>;

export const domainProvisioningResponseSchema = z.object({
  status: z.literal("provisioning"),
  message: z.string(),
  retry_after_seconds: z.number(),
});
export type DomainProvisioningResponse = z.infer<
  typeof domainProvisioningResponseSchema
>;

// POST /domains can return either the full record (201) or a provisioning
// placeholder (202) while customer email infrastructure is still being
// prepared. Try the full record first; fall back to the placeholder shape.
export const createDomainResponseSchema = z.union([
  senderDomainSchema,
  domainProvisioningResponseSchema,
]);
export type CreateDomainResponse = z.infer<typeof createDomainResponseSchema>;

export function isProvisioningResponse(
  response: CreateDomainResponse,
): response is DomainProvisioningResponse {
  return "status" in response && response.status === "provisioning";
}

export const updateDomainInputSchema = z.object({
  tls: domainTlsSchema.optional(),
});
export type UpdateDomainInput = z.infer<typeof updateDomainInputSchema>;

export const DOMAIN_STATUS_LABEL: Record<DomainStatus, string> = {
  not_started: "Not started",
  pending: "Pending",
  verified: "Verified",
  partially_verified: "Partially verified",
  partially_failed: "Partially failed",
  failed: "Failed",
  temporary_failure: "Temporary failure",
  disabled: "Disabled",
};

export const DOMAIN_REGION_LABEL: Record<DomainRegion, string> = {
  "us-east-1": "US East (N. Virginia)",
  "eu-north-1": "EU North (Stockholm)",
};
