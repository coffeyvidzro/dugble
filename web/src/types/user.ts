// src/types/user.ts

import { z } from "zod";
import { passwordSchema } from "@/lib/validation/password";

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  email_verified: z.boolean(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const updateNameInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
});
export type UpdateNameInput = z.infer<typeof updateNameInputSchema>;

export const updatePasswordInputSchema = z.object({
  password: passwordSchema,
});
export type UpdatePasswordInput = z.infer<typeof updatePasswordInputSchema>;

export const deleteAccountResponseSchema = z.object({
  deleted: z.boolean(),
});

export const changeEmailInputSchema = z.object({
  email: z.email("Please enter a valid email address."),
  current_password: z.string().min(1, "Enter your current password."),
});
export type ChangeEmailInput = z.infer<typeof changeEmailInputSchema>;

export const pendingEmailChangeSchema = z.object({
  email: z.email(),
  pending_email: z.email(),
  verification_expires_at: z.string(),
});
export type PendingEmailChange = z.infer<typeof pendingEmailChangeSchema>;

export const verifyEmailChangeInputSchema = z.object({
  token: z.string(),
});
export type VerifyEmailChangeInput = z.infer<
  typeof verifyEmailChangeInputSchema
>;

export const cancelPendingEmailChangeResponseSchema = z.object({
  cancelled: z.boolean(),
});
