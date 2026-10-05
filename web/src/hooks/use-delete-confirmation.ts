// src/hooks/use-delete-confirmation.ts

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
    } catch {
      // Error state is surfaced via the mutation itself (toast, etc).
      // Keep the dialog open so the user can retry.
    }
  }, [pendingItem, deleteFn]);

  return { pendingItem, requestDelete, cancelDelete, confirmDelete };
}
