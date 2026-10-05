// src/hooks/queries/use-security.ts

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import {
  mfaStatusSchema,
  mfaVerifyResponseSchema,
  revokeResponseSchema,
  totpConfirmResponseSchema,
  totpEnrollmentSchema,
  userSessionListSchema,
} from "@/types/security";

// ---------------------------------------------------------------------------
// Two-factor authentication (user-scoped — no team header needed)
// ---------------------------------------------------------------------------

export function useMfaStatus() {
  return useQuery({
    queryKey: queryKeys.auth.mfa(),
    queryFn: ({ signal }) =>
      apiGet("/auth/mfa", mfaStatusSchema, { signal, teamId: null }),
    staleTime: 60_000,
  });
}

/** Starts enrollment. The returned secret is shown once and never cached. */
export function useEnrollTotp() {
  return useMutation({
    mutationFn: () =>
      apiMutate(
        "/auth/mfa/totp/enroll",
        "POST",
        totpEnrollmentSchema,
        undefined,
        {
          teamId: null,
        },
      ),
    gcTime: 0,
  });
}

/** Confirms enrollment with a code; returns one-time recovery codes. */
export function useConfirmTotp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      apiMutate(
        "/auth/mfa/totp/confirm",
        "POST",
        totpConfirmResponseSchema,
        { code },
        { teamId: null },
      ),
    gcTime: 0,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.mfa(), { enabled: true });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.auth.sessions(),
      });
    },
  });
}

/**
 * Disables 2FA. The API treats this as a sensitive action, so the user proves
 * possession first (TOTP or recovery code step-up), then the factor is removed.
 */
export function useDisableMfa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      method,
      code,
    }: {
      method: "totp" | "recovery";
      code: string;
    }) => {
      await apiMutate(
        method === "totp" ? "/auth/mfa/verify" : "/auth/mfa/recovery",
        "POST",
        mfaVerifyResponseSchema,
        { code },
        { teamId: null },
      );
      return apiMutate("/auth/mfa", "DELETE", mfaStatusSchema, undefined, {
        teamId: null,
      });
    },
    onSuccess: (status) => {
      queryClient.setQueryData(queryKeys.auth.mfa(), status);
    },
  });
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.auth.sessions(),
    queryFn: ({ signal }) =>
      apiGet("/sessions", userSessionListSchema, { signal, teamId: null }),
    staleTime: 30_000,
  });
}

type RevokeTarget = { scope: "one"; sessionId: string } | { scope: "others" };

export function useRevokeSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (target: RevokeTarget) =>
      apiMutate(
        target.scope === "others"
          ? "/sessions/others"
          : `/sessions/${encodeURIComponent(target.sessionId)}`,
        "DELETE",
        revokeResponseSchema,
        undefined,
        { teamId: null },
      ),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions() }),
  });
}
