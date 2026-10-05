// src/hooks/mutations/use-optimistic-list-mutation.ts

"use client";

import {
  type QueryKey,
  type UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type OptimisticListMutationConfig<TVariables, TData, TItem> = {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  optimisticUpdate: (
    current: TItem[] | undefined,
    variables: TVariables,
  ) => TItem[] | undefined;
  reconcile?: (
    current: TItem[] | undefined,
    data: TData,
    variables: TVariables,
  ) => TItem[] | undefined;
};

type OptimisticContext<TItem> = { previous: TItem[] | undefined };

export function useOptimisticListMutation<TVariables, TData, TItem>({
  queryKey,
  mutationFn,
  optimisticUpdate,
  reconcile,
}: OptimisticListMutationConfig<TVariables, TData, TItem>): UseMutationResult<
  TData,
  Error,
  TVariables,
  OptimisticContext<TItem>
> {
  const queryClient = useQueryClient();

  return useMutation({
    // Responses may include one-time secrets (e.g. webhook signing secrets);
    // they are stripped before touching the list cache, and the mutation
    // itself is discarded once unobserved.
    gcTime: 0,
    mutationFn,

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TItem[]>(queryKey);
      queryClient.setQueryData<TItem[]>(queryKey, (current) =>
        optimisticUpdate(current, variables),
      );
      return { previous };
    },

    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSuccess: reconcile
      ? (data, variables) => {
          queryClient.setQueryData<TItem[]>(queryKey, (current) =>
            reconcile(current, data, variables),
          );
        }
      : undefined,

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
