// src/hooks/queries/use-webhooks.ts

"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useOptimisticListMutation } from "@/hooks/mutations/use-optimistic-list-mutation";
import { assertPermission } from "@/lib/api/assert-permission";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type CreatedWebhookEndpoint,
  type CreateWebhookEndpointInput,
  createdWebhookEndpointSchema,
  createWebhookEndpointInputSchema,
  rotateWebhookSecretResponseSchema,
  type UpdateWebhookEndpointInput,
  updateWebhookEndpointInputSchema,
  type WebhookEndpoint,
  type WebhookSecretOnly,
  webhookDeliverySchema,
  webhookEndpointDeletedSchema,
  webhookEndpointSchema,
  webhookEndpointsListSchema,
  webhookSecretOnlySchema,
} from "@/types/webhook";
import { useTeamPermissions } from "./use-team-permissions";

export function useWebhookEndpoints() {
  const activeTeamId = useActiveTeamId();

  return useQuery({
    queryKey: queryKeys.webhooks.list(activeTeamId),
    queryFn: ({ signal }) =>
      apiGet("/webhook-endpoints", webhookEndpointsListSchema, {
        signal,
        teamId: activeTeamId,
      }),
    enabled: Boolean(activeTeamId),
    staleTime: 30_000,
  });
}

const createWebhookResponseSchema = z.union([
  createdWebhookEndpointSchema,
  webhookSecretOnlySchema,
]);
type CreateWebhookResponse = CreatedWebhookEndpoint | WebhookSecretOnly;

function isFullWebhookRecord(
  response: CreateWebhookResponse,
): response is CreatedWebhookEndpoint {
  return "id" in response;
}

type CreateWebhookVariables = {
  input: CreateWebhookEndpointInput;
  tempId: string;
};

export function useCreateWebhookEndpoint() {
  const activeTeamId = useActiveTeamId();
  const { canManageTeam } = useTeamPermissions();

  const mutation = useOptimisticListMutation<
    CreateWebhookVariables,
    CreateWebhookResponse,
    WebhookEndpoint
  >({
    queryKey: queryKeys.webhooks.list(activeTeamId),
    mutationFn: async ({ input }) => {
      assertPermission(
        canManageTeam,
        "Only admins and owners can add webhook endpoints.",
      );
      return apiMutate(
        "/webhook-endpoints",
        "POST",
        createWebhookResponseSchema,
        createWebhookEndpointInputSchema.parse(input),
      );
    },
    optimisticUpdate: (current, { input, tempId }) => {
      const placeholder: WebhookEndpoint = {
        id: tempId,
        team_id: activeTeamId ?? "",
        url: input.url,
        enabled: true,
        subscribed_events: input.subscribed_events,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        disabled_at: null,
        consecutive_failures: 0,
        last_failure_at: null,
        disabled_reason: null,
      };
      return current ? [placeholder, ...current] : [placeholder];
    },
    reconcile: (current, data, { tempId }) => {
      if (!current) return current;

      if (isFullWebhookRecord(data)) {
        const { signing_secret: _signing_secret, ...endpoint } = data;
        return current.map((endpoint_) =>
          endpoint_.id === tempId ? endpoint : endpoint_,
        );
      }
      return current.filter((endpoint) => endpoint.id !== tempId);
    },
  });

  return {
    ...mutation,
    mutate: (
      input: CreateWebhookEndpointInput,
      options?: Parameters<typeof mutation.mutate>[1],
    ) => mutation.mutate({ input, tempId: crypto.randomUUID() }, options),
    mutateAsync: (input: CreateWebhookEndpointInput) =>
      mutation.mutateAsync({ input, tempId: crypto.randomUUID() }),
  };
}

export function useUpdateWebhookEndpoint() {
  const activeTeamId = useActiveTeamId();
  const { canManageTeam } = useTeamPermissions();

  return useOptimisticListMutation<
    { id: string; input: UpdateWebhookEndpointInput },
    WebhookEndpoint,
    WebhookEndpoint
  >({
    queryKey: queryKeys.webhooks.list(activeTeamId),
    mutationFn: async ({ id, input }) => {
      assertPermission(
        canManageTeam,
        "Only admins and owners can update webhook endpoints.",
      );
      return apiMutate(
        `/webhook-endpoints/${encodeURIComponent(id)}`,
        "PATCH",
        webhookEndpointSchema,
        updateWebhookEndpointInputSchema.parse(input),
      );
    },
    optimisticUpdate: (current, { id, input }) =>
      current?.map((endpoint) =>
        endpoint.id === id ? { ...endpoint, ...input } : endpoint,
      ),
    reconcile: (current, updated) =>
      current?.map((endpoint) =>
        endpoint.id === updated.id ? updated : endpoint,
      ),
  });
}

export function useRotateWebhookSecret() {
  const { canManageTeam } = useTeamPermissions();

  return useMutation({
    // Holds the new signing secret — never retain it past the dialog.
    gcTime: 0,
    mutationFn: async (id: string) => {
      assertPermission(
        canManageTeam,
        "Only admins and owners can roll a webhook's signing secret.",
      );
      return apiMutate(
        `/webhook-endpoints/${encodeURIComponent(id)}/rotate-secret`,
        "POST",
        rotateWebhookSecretResponseSchema,
      );
    },
  });
}

/** Fires a sample event at the endpoint; doesn't touch the list cache. */
export function useSendTestWebhookEvent() {
  const { canManageTeam } = useTeamPermissions();

  return useMutation({
    mutationFn: async (id: string) => {
      assertPermission(
        canManageTeam,
        "Only admins and owners can send test events.",
      );
      return apiMutate(
        `/webhook-endpoints/${encodeURIComponent(id)}/test`,
        "POST",
        webhookDeliverySchema,
      );
    },
  });
}

export function useDeleteWebhookEndpoint() {
  const activeTeamId = useActiveTeamId();
  const { canManageTeam } = useTeamPermissions();

  return useOptimisticListMutation<string, string, WebhookEndpoint>({
    queryKey: queryKeys.webhooks.list(activeTeamId),
    mutationFn: async (id) => {
      assertPermission(
        canManageTeam,
        "Only admins and owners can delete webhook endpoints.",
      );
      await apiMutate(
        `/webhook-endpoints/${encodeURIComponent(id)}`,
        "DELETE",
        webhookEndpointDeletedSchema,
      );
      return id;
    },
    optimisticUpdate: (current, id) =>
      current?.filter((endpoint) => endpoint.id !== id),
  });
}
