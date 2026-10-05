"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { keepPreviousTeamData } from "@/lib/api/team-placeholder";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  type CreateTemplateInput,
  createTemplateInputSchema,
  type TemplateListParams,
  type TemplatePreviewInput,
  type TemplateTestSendInput,
  templateDeleteResponseSchema,
  templateListSchema,
  templateMutationResponseSchema,
  templatePreviewInputSchema,
  templatePreviewSchema,
  templateResourceSchema,
  templateTestSendInputSchema,
  type UpdateTemplateInput,
  updateTemplateInputSchema,
} from "@/types/template-api";

function buildListQuery(params: TemplateListParams): string {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.offset) searchParams.set("offset", String(params.offset));
  const qs = searchParams.toString();
  return qs ? `/templates?${qs}` : "/templates";
}

export function useTemplatesApi(params: TemplateListParams = { limit: 100 }) {
  const teamId = useActiveTeamId();
  return useQuery({
    queryKey: queryKeys.templatesApi.list(teamId, params),
    enabled: Boolean(teamId),
    queryFn: ({ signal }) =>
      apiGet(buildListQuery(params), templateListSchema, { signal, teamId }),
    placeholderData: keepPreviousTeamData(teamId),
    staleTime: 15_000,
  });
}

export function useTemplateApi(templateId: string) {
  return useQuery({
    queryKey: queryKeys.templatesApi.detail(templateId),
    queryFn: ({ signal }) =>
      apiGet(
        `/templates/${encodeURIComponent(templateId)}`,
        templateResourceSchema,
        {
          signal,
        },
      ),
    enabled: Boolean(templateId),
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTemplateInput) =>
      apiMutate(
        "/templates",
        "POST",
        templateMutationResponseSchema,
        createTemplateInputSchema.parse(input),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.templatesApi.lists(),
      });
    },
  });
}

export function useUpdateTemplate(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTemplateInput) =>
      apiMutate(
        `/templates/${encodeURIComponent(templateId)}`,
        "PATCH",
        templateMutationResponseSchema,
        updateTemplateInputSchema.parse(input),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.templatesApi.detail(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.templatesApi.lists(),
      });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      apiMutate(
        `/templates/${encodeURIComponent(templateId)}`,
        "DELETE",
        templateDeleteResponseSchema,
      ),
    onSuccess: (_data, templateId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.templatesApi.detail(templateId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.templatesApi.lists(),
      });
    },
  });
}

export function usePublishTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      apiMutate(
        `/templates/${encodeURIComponent(templateId)}/publish`,
        "POST",
        templateMutationResponseSchema,
      ),
    onSuccess: (_data, templateId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.templatesApi.detail(templateId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.templatesApi.lists(),
      });
    },
  });
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) =>
      apiMutate(
        `/templates/${encodeURIComponent(templateId)}/duplicate`,
        "POST",
        templateMutationResponseSchema,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.templatesApi.lists(),
      });
    },
  });
}

export function useTemplatePreview(
  templateId: string,
  {
    enabled = true,
    input = {},
  }: { enabled?: boolean; input?: TemplatePreviewInput } = {},
) {
  return useQuery({
    queryKey: [...queryKeys.templatesApi.preview(templateId), input] as const,
    queryFn: ({ signal }) =>
      apiMutate(
        `/templates/${encodeURIComponent(templateId)}/preview`,
        "POST",
        templatePreviewSchema,
        templatePreviewInputSchema.parse(input),
        { signal },
      ),
    enabled: enabled && Boolean(templateId),
    staleTime: 0,
    gcTime: 60_000,
  });
}

export function useTestSendTemplate(templateId: string) {
  return useMutation({
    mutationFn: (input: TemplateTestSendInput) =>
      apiMutate(
        `/templates/${encodeURIComponent(templateId)}/test-send`,
        "POST",
        templateMutationResponseSchema,
        templateTestSendInputSchema.parse(input),
      ),
  });
}
