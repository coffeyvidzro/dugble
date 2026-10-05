"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type CreateDomainInput,
  createDomainInputSchema,
  createDomainResponseSchema,
  senderDomainListSchema,
  senderDomainSchema,
  type UpdateDomainInput,
  updateDomainInputSchema,
} from "@/types/sender-domain-api";

export function useSenderDomains() {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.senderDomainsApi.list(teamId),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet("/domains", senderDomainListSchema, { signal, teamId }),
    staleTime: 30_000,
  });
}

export function useSenderDomain(domainId: string) {
  return useQuery({
    queryKey: queryKeys.senderDomainsApi.detail(domainId),
    queryFn: ({ signal }) =>
      apiGet(`/domains/${encodeURIComponent(domainId)}`, senderDomainSchema, {
        signal,
      }),
    enabled: Boolean(domainId),
  });
}

export function useCreateSenderDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDomainInput) =>
      apiMutate(
        "/domains",
        "POST",
        createDomainResponseSchema,
        createDomainInputSchema.parse(input),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.senderDomainsApi.lists(),
      });
    },
  });
}

export function useUpdateSenderDomain(domainId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDomainInput) =>
      apiMutate(
        `/domains/${encodeURIComponent(domainId)}`,
        "PATCH",
        senderDomainSchema,
        updateDomainInputSchema.parse(input),
      ),
    onSuccess: (domain) => {
      queryClient.setQueryData(
        queryKeys.senderDomainsApi.detail(domainId),
        domain,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.senderDomainsApi.lists(),
      });
    },
  });
}

export function useVerifySenderDomain(domainId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiMutate(
        `/domains/${encodeURIComponent(domainId)}/verify`,
        "POST",
        senderDomainSchema,
      ),
    onSuccess: (domain) => {
      queryClient.setQueryData(
        queryKeys.senderDomainsApi.detail(domainId),
        domain,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.senderDomainsApi.lists(),
      });
    },
  });
}

export function useDeleteSenderDomain() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) =>
      apiMutate(
        `/domains/${encodeURIComponent(domainId)}`,
        "DELETE",
        senderDomainSchema,
      ),
    onSuccess: (_domain, domainId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.senderDomainsApi.detail(domainId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.senderDomainsApi.lists(),
      });
    },
  });
}
