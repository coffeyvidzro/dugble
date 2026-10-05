// src/hooks/queries/use-user.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { resetActiveTeam } from "@/store/active-team-store";
import {
  type ChangeEmailInput,
  cancelPendingEmailChangeResponseSchema,
  changeEmailInputSchema,
  deleteAccountResponseSchema,
  pendingEmailChangeSchema,
  type UpdateNameInput,
  type UpdatePasswordInput,
  updateNameInputSchema,
  updatePasswordInputSchema,
  userSchema,
  type VerifyEmailChangeInput,
  verifyEmailChangeInputSchema,
} from "@/types/user";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: ({ signal }) => apiGet("/users/me", userSchema, { signal }),
    staleTime: 60_000,
  });
}

export function useUpdateName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNameInput) =>
      apiMutate(
        "/users/me",
        "PATCH",
        userSchema,
        updateNameInputSchema.parse(input),
      ),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.users.me(), user);
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (input: UpdatePasswordInput) =>
      apiMutate(
        "/users/password",
        "PATCH",
        userSchema,
        updatePasswordInputSchema.parse(input),
      ),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate("/users/me", "DELETE", deleteAccountResponseSchema),
    onSuccess: () => {
      queryClient.clear();
      resetActiveTeam();
    },
  });
}

export function useChangeEmail() {
  return useMutation({
    mutationFn: (input: ChangeEmailInput) =>
      apiMutate(
        "/users/email",
        "PATCH",
        pendingEmailChangeSchema,
        changeEmailInputSchema.parse(input),
      ),
  });
}

export function useResendEmailChangeVerification() {
  return useMutation({
    mutationFn: () =>
      apiMutate("/users/email/resend", "POST", pendingEmailChangeSchema),
  });
}

export function useCancelPendingEmailChange() {
  return useMutation({
    mutationFn: () =>
      apiMutate(
        "/users/email/pending",
        "DELETE",
        cancelPendingEmailChangeResponseSchema,
      ),
  });
}

export function useVerifyEmailChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: VerifyEmailChangeInput) =>
      apiMutate(
        "/users/email/verify",
        "POST",
        userSchema,
        verifyEmailChangeInputSchema.parse(input),
      ),
    onSuccess: () => {
      queryClient.clear();
      resetActiveTeam();
    },
  });
}
