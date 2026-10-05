// src/components/providers/app-providers.tsx

"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { QueryProvider } from "@/components/providers/query-provider";

/**
 * Single composition point for client-side providers.
 * - QueryProvider: server state (TanStack Query).
 * - NuqsAdapter: type-safe URL state for filters, tabs and pagination.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryProvider>
  );
}
