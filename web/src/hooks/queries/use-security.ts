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

export function useMfaStatus() {
  return useQuery({
    queryKey: queryKeys.auth.mfa(),
    queryFn: ({ signal }) =>
      apiGet("/auth/mfa", mfaStatusSchema, { signal, teamId: null }),
    staleTime: 60_000,
  });
}

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
