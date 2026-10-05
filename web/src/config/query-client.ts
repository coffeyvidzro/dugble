import {
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api/error";
import { isTransientUpstreamStatus } from "@/lib/session-resolver";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (isTransientUpstreamStatus(error.status) || error.status >= 500) {
      return failureCount < 3;
    }
    return false;
  }

  return failureCount < 2;
}

function retryDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 30_000);
}

function handleAuthExpiry(error: unknown): void {
  if (
    typeof window !== "undefined" &&
    error instanceof ApiError &&
    error.isAuthError &&
    window.location.pathname.startsWith("/dashboard")
  ) {
    window.location.assign("/login");
  }
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        retryDelay,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },

    queryCache: new QueryCache({ onError: handleAuthExpiry }),
    mutationCache: new MutationCache({ onError: handleAuthExpiry }),
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
