// src/hooks/queries/use-contacts.ts
"use client";

import {
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api/fetcher";
import { queryKeys } from "@/lib/api/query-keys";
import { useActiveTeamId } from "@/store/active-team-store";
import {
  CONTACTS_PAGE_SIZE,
  type CreateContactInput,
  contactSchema,
  contactSegmentMembershipSchema,
  contactSegmentRemovedSchema,
  contactSegmentsListSchema,
  contactsListSchema,
  contactTopicListSchema,
  contactTopicUpdateResponseSchema,
  createContactInputSchema,
  type UpdateContactInput,
  type UpdateContactTopicsInput,
  updateContactInputSchema,
  updateContactTopicsInputSchema,
} from "@/types/contact";

// ---------------------------------------------------------------------------
// List / detail
// ---------------------------------------------------------------------------

/**
 * GET /contacts only takes limit/offset and returns a flat array (no
 * has_more), so pagination is inferred: a full page means there may be more.
 */
export function useContacts(limit: number = CONTACTS_PAGE_SIZE) {
  const activeTeamId = useActiveTeamId();

  return useInfiniteQuery({
    queryKey: queryKeys.contacts.list(activeTeamId, limit),
    queryFn: ({ pageParam, signal }) =>
      apiGet(
        `/contacts?limit=${limit}&offset=${pageParam}`,
        contactsListSchema,
        { signal, teamId: activeTeamId },
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === limit ? allPages.length * limit : undefined,
    enabled: Boolean(activeTeamId),
    staleTime: 15_000,
  });
}

export function useContact(contactId: string) {
  return useQuery({
    queryKey: queryKeys.contacts.detail(contactId),
    queryFn: ({ signal }) =>
      apiGet(`/contacts/${encodeURIComponent(contactId)}`, contactSchema, {
        signal,
      }),
    enabled: Boolean(contactId),
  });
}

/**
 * Contacts are loaded via useInfiniteQuery, which makes optimistic patching
 * of the paged cache more trouble than it's worth for create/update/delete.
 * Mutations below just invalidate every loaded list page instead, matching
 * the simpler pattern already used for templates and campaigns.
 */
function invalidateContactLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.contacts.lists() });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContactInput) =>
      apiMutate(
        "/contacts",
        "POST",
        contactSchema,
        createContactInputSchema.parse(input),
      ),
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.contacts.detail(created.id), created);
      invalidateContactLists(queryClient);
    },
  });
}

export function useUpdateContact(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateContactInput) =>
      apiMutate(
        `/contacts/${encodeURIComponent(contactId)}`,
        "PATCH",
        contactSchema,
        updateContactInputSchema.parse(input),
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.contacts.detail(contactId), updated);
      invalidateContactLists(queryClient);
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: string) =>
      apiMutate(
        `/contacts/${encodeURIComponent(contactId)}`,
        "DELETE",
        contactSchema,
      ),
    onSuccess: (_deleted, contactId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.contacts.detail(contactId),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.contacts.segments(contactId),
      });
      invalidateContactLists(queryClient);
    },
  });
}

// ---------------------------------------------------------------------------
// Segment membership, viewed from a single contact
// ---------------------------------------------------------------------------

export function useContactSegments(contactId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.contacts.segments(contactId),
    queryFn: ({ signal }) =>
      apiGet(
        `/contacts/${encodeURIComponent(contactId)}/segments`,
        contactSegmentsListSchema,
        { signal },
      ),
    enabled: Boolean(contactId) && enabled,
  });
}

export function useAddContactToSegment(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (segmentId: string) =>
      apiMutate(
        `/contacts/${encodeURIComponent(contactId)}/segments/${encodeURIComponent(segmentId)}`,
        "POST",
        contactSegmentMembershipSchema,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contacts.segments(contactId),
      });
    },
  });
}

export function useRemoveContactFromSegment(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (segmentId: string) =>
      apiMutate(
        `/contacts/${encodeURIComponent(contactId)}/segments/${encodeURIComponent(segmentId)}`,
        "DELETE",
        contactSegmentRemovedSchema,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contacts.segments(contactId),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Topic subscriptions, viewed from a single contact
// Ready for a future "Subscriptions" tab — not wired into the list UI yet.
// ---------------------------------------------------------------------------

export function useContactTopics(contactId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.contacts.topics(contactId),
    queryFn: ({ signal }) =>
      apiGet(
        `/contacts/${encodeURIComponent(contactId)}/topics`,
        contactTopicListSchema,
        {
          signal,
        },
      ),
    enabled: Boolean(contactId) && enabled,
  });
}

export function useUpdateContactTopics(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateContactTopicsInput) =>
      apiMutate(
        `/contacts/${encodeURIComponent(contactId)}/topics`,
        "PATCH",
        contactTopicUpdateResponseSchema,
        updateContactTopicsInputSchema.parse(input),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contacts.topics(contactId),
      });
    },
  });
}
