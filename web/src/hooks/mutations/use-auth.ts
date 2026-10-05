// src/hooks/mutations/use-auth.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiMutate } from "@/lib/api/fetcher";
import { resetActiveTeam } from "@/store/active-team-store";
import {
  type ForgotPasswordInput,
  forgotPasswordInputSchema,
  forgotPasswordResponseSchema,
  type LoginInput,
  loginInputSchema,
  loginResponseSchema,
  logoutResponseSchema,
  type RegisterInput,
  type ResendVerificationInput,
  type ResetPasswordInput,
  registerInputSchema,
  registerResponseSchema,
  resendVerificationInputSchema,
  resendVerificationResponseSchema,
  resetPasswordInputSchema,
  resetPasswordResponseSchema,
  type VerifyEmailInput,
  type VerifyRecoveryInput,
  type VerifyTotpInput,
  verifyEmailInputSchema,
  verifyEmailResponseSchema,
  verifyRecoveryInputSchema,
  verifyTotpInputSchema,
} from "@/types/auth";

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiMutate(
        "/auth/register",
        "POST",
        registerResponseSchema,
        registerInputSchema.parse(input),
      ),
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiMutate(
        "/auth/login",
        "POST",
        loginResponseSchema,
        loginInputSchema.parse(input),
      ),
  });
}

export function useVerifyLoginTotp() {
  return useMutation({
    mutationFn: (input: VerifyTotpInput) =>
      apiMutate(
        "/auth/login/mfa/totp",
        "POST",
        loginResponseSchema,
        verifyTotpInputSchema.parse(input),
      ),
  });
}

export function useVerifyLoginRecoveryCode() {
  return useMutation({
    mutationFn: (input: VerifyRecoveryInput) =>
      apiMutate(
        "/auth/login/mfa/recovery",
        "POST",
        loginResponseSchema,
        verifyRecoveryInputSchema.parse(input),
      ),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: VerifyEmailInput) =>
      apiMutate(
        "/auth/email/verify",
        "POST",
        verifyEmailResponseSchema,
        verifyEmailInputSchema.parse(input),
      ),
  });
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: (input: ResendVerificationInput) =>
      apiMutate(
        "/auth/email/resend",
        "POST",
        resendVerificationResponseSchema,
        resendVerificationInputSchema.parse(input),
      ),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      apiMutate(
        "/auth/password/forgot",
        "POST",
        forgotPasswordResponseSchema,
        forgotPasswordInputSchema.parse(input),
      ),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      apiMutate(
        "/auth/password/reset",
        "POST",
        resetPasswordResponseSchema,
        resetPasswordInputSchema.parse(input),
      ),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiMutate("/auth/logout", "POST", logoutResponseSchema),
    onSuccess: () => {
      // Nothing from this account may survive into the next session.
      queryClient.clear();
      resetActiveTeam();
    },
  });
}
