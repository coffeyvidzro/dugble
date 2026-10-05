// src/types/auth.ts

import { z } from "zod";
import { userSchema } from "@/types/user";

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export const registerInputSchema = z.object({
  email: z.email(),
  name: z.string(),
  password: z.string(),
});
export type RegisterInput = z.infer<typeof registerInputSchema>;

export const registerResponseSchema = z.object({ user: userSchema });

// ---------------------------------------------------------------------------
// Login (+ MFA challenge)
// ---------------------------------------------------------------------------

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string(),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginResponseSchema = z.object({
  user: userSchema.optional(),
  mfa_required: z.boolean(),
  challenge_token: z.string().optional(),
  methods: z.array(z.string()).optional(),
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const verifyTotpInputSchema = z.object({
  challenge_token: z.string(),
  code: z.string(),
});
export type VerifyTotpInput = z.infer<typeof verifyTotpInputSchema>;

export const verifyRecoveryInputSchema = z.object({
  challenge_token: z.string(),
  code: z.string(),
});
export type VerifyRecoveryInput = z.infer<typeof verifyRecoveryInputSchema>;

// ---------------------------------------------------------------------------
// Email verification
// ---------------------------------------------------------------------------

export const verifyEmailInputSchema = z.object({
  email: z.email(),
  token: z.string(),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailInputSchema>;

export const verifyEmailResponseSchema = z.object({
  email_verified: z.boolean(),
});

export const resendVerificationInputSchema = z.object({ email: z.email() });
export type ResendVerificationInput = z.infer<
  typeof resendVerificationInputSchema
>;

export const resendVerificationResponseSchema = z.object({ sent: z.boolean() });

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export const forgotPasswordInputSchema = z.object({ email: z.email() });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const forgotPasswordResponseSchema = z.object({ sent: z.boolean() });

export const resetPasswordInputSchema = z.object({
  email: z.email(),
  token: z.string(),
  password: z.string(),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

export const resetPasswordResponseSchema = z.object({
  password_reset: z.boolean(),
});

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export const logoutResponseSchema = z.object({ logged_out: z.boolean() });
