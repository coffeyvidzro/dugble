// src/components/providers/query-provider.tsx
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { getQueryClient } from "@/config/query-client";

export function QueryProvider({ children }: { children: ReactNode }) {
  // Calling this directly in the render body (not useState) is the pattern
  // TanStack's own Next.js guide recommends: on the server it returns a
  // fresh client every render (fine, request-scoped); in the browser the
  // module-level singleton in getQueryClient() means it's stable across
  // re-renders without needing extra state.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}
