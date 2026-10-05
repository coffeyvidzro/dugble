"use client";

import { useCallback, useState } from "react";

export function useDeleteConfirmation<T>(
  deleteFn: (item: T) => Promise<unknown>,
) {
  const [pendingItem, setPendingItem] = useState<T | null>(null);

  const requestDelete = useCallback((item: T) => {
    setPendingItem(item);
  }, []);

  const cancelDelete = useCallback(() => {
    setPendingItem(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingItem) return;

    try {
      await deleteFn(pendingItem);
      setPendingItem(null);
    } catch {}
  }, [pendingItem, deleteFn]);

  return { pendingItem, requestDelete, cancelDelete, confirmDelete };
}
