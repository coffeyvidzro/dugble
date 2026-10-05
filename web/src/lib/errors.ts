// src/lib/errors.ts

/** User-facing message for an unknown thrown value (ApiError, NetworkError, …). */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
