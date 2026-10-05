// src/types/security.ts
//
// Contracts for `/auth/mfa*` and `/sessions*` (see authentication.md).

import { z } from "zod";

/** Six-digit TOTP code as typed by the user (spaces stripped). */
export const totpCodeSchema = z
  .string()
  .transform((value) => value.replace(/\s+/g, ""))
  .pipe(z.string().regex(/^\d{6}$/, "Enter the 6-digit code."));

/** Recovery codes are opaque; only trim and require a sensible length. */
export const recoveryCodeSchema = z
  .string()
  .trim()
  .min(6, "Enter a recovery code.")
  .max(64, "That recovery code is too long.");

// ---------------------------------------------------------------------------
// MFA
// ---------------------------------------------------------------------------

export const mfaStatusSchema = z.object({ enabled: z.boolean() });
export type MfaStatus = z.infer<typeof mfaStatusSchema>;

export const totpEnrollmentSchema = z.object({
  secret: z.string().min(1),
  uri: z.string().startsWith("otpauth://"),
});
export type TotpEnrollment = z.infer<typeof totpEnrollmentSchema>;

export const totpConfirmResponseSchema = z.object({
  recovery_codes: z.array(z.string()),
});

export const mfaVerifyResponseSchema = z.object({ verified: z.boolean() });

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export const userSessionSchema = z.object({
  id: z.string(),
  user_agent: z.string().nullish(),
  ip_address: z.string().nullish(),
  expires_at: z.string(),
  revoked_at: z.string().nullish(),
  created_at: z.string(),
  last_seen_at: z.string().nullish(),
  authentication_method: z.string().nullish(),
  assurance_level: z.string().nullish(),
  authenticated_at: z.string().nullish(),
  mfa_completed_at: z.string().nullish(),
});
export type UserSession = z.infer<typeof userSessionSchema>;

export const userSessionListSchema = z.array(userSessionSchema);

export const revokeResponseSchema = z.object({ revoked: z.boolean() });
