// src/lib/api/fetcher.ts

import "client-only";

import type { z } from "zod";
import { ApiError, NetworkError, parseApiError } from "@/lib/api/error";
import { type Pagination, paginatedEnvelopeSchema } from "@/lib/api/pagination";
import { csrfFetch } from "@/lib/csrf-fetch";
import { getActiveTeamIdSnapshot } from "@/store/active-team-store";

const API_BASE = "/api/v1";

type ApiEnvelope = { success: true; data: unknown };

type FetchOptions = Omit<RequestInit, "method" | "body"> & {
  /**
   * Team the request is scoped to. Queries pass the team captured in their
   * query key so the header can never disagree with the cache entry, even if
   * the user switches teams while a request is in flight. When omitted, the
   * currently selected team is used (mutations triggered by user actions).
   */
  teamId?: string | null;
};

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

function requestHeaders(teamId?: string | null): Record<string, string> {
  const resolved = teamId === undefined ? getActiveTeamIdSnapshot() : teamId;
  return resolved ? { "X-Team-ID": resolved } : {};
}

function isEnvelope(payload: unknown): payload is ApiEnvelope {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    (payload as { success: unknown }).success === true &&
    "data" in payload
  );
}

async function unwrap(response: Response): Promise<unknown> {
  if (!response.ok) {
    throw await parseApiError(response);
  }
  if (response.status === 204) {
    return undefined;
  }
  const payload: unknown = await response.json();
  return isEnvelope(payload) ? payload.data : payload;
}

function validate<T>(schema: z.ZodType<T>, data: unknown, path: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(
      `[api] Response shape mismatch for ${path}`,
      result.error.format(),
    );
    throw new ApiError(
      `The server returned unexpected data for ${path}. This usually means the backend contract changed.`,
      0,
      { code: "invalid_response" },
    );
  }
  return result.data;
}

function isAbortError(cause: unknown): cause is DOMException {
  return cause instanceof DOMException && cause.name === "AbortError";
}

async function rawGet(
  path: string,
  { teamId, ...init }: FetchOptions,
): Promise<Response> {
  try {
    return await fetch(buildUrl(path), {
      ...init,
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...requestHeaders(teamId),
        ...init.headers,
      },
    });
  } catch (cause) {
    if (isAbortError(cause)) throw cause;
    throw new NetworkError(cause);
  }
}

export async function apiGet<T>(
  path: string,
  schema: z.ZodType<T>,
  init: FetchOptions = {},
): Promise<T> {
  const response = await rawGet(path, init);
  return validate(schema, await unwrap(response), path);
}

export async function apiGetPage<T>(
  path: string,
  itemSchema: z.ZodType<T>,
  init: FetchOptions = {},
): Promise<{ items: T[]; pagination: Pagination }> {
  const response = await rawGet(path, init);
  if (!response.ok) {
    throw await parseApiError(response);
  }
  const payload: unknown =
    response.status === 204 ? undefined : await response.json();
  return validate(paginatedEnvelopeSchema(itemSchema), payload, path);
}

export async function apiMutate<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  schema: z.ZodType<T>,
  body?: unknown,
  { teamId, ...init }: FetchOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await csrfFetch(buildUrl(path), {
      ...init,
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...requestHeaders(teamId),
        ...init.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    if (isAbortError(cause)) throw cause;
    throw new NetworkError(cause);
  }
  return validate(schema, await unwrap(response), path);
}

export { ApiError, NetworkError };
