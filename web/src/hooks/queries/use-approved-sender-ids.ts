// src/hooks/queries/use-approved-sender-ids.ts
"use client";

import { useMemo } from "react";
import type { SenderId } from "@/types/sender-id";
import { useSenderIds } from "./use-sender-ids";

export function useApprovedSenderIds() {
  const query = useSenderIds();
  // Memoised so consumers get a stable array reference between renders.
  const approved = useMemo<SenderId[]>(
    () =>
      (query.data ?? []).filter((senderId) => senderId.status === "approved"),
    [query.data],
  );

  return { ...query, data: approved };
}
