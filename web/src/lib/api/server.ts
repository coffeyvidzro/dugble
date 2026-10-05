import "server-only";

import type { z } from "zod";
import { env } from "@/config/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";
import { getSessionId } from "@/lib/session";

const BACKEND_URL = env.BACKEND_URL.replace(/\/+$/, "");

type ServerGetOptions = { teamId?: string | null };

/**
 * Authenticated GET from Server Components straight to the Go API, forwarding
 * only the opaque session cookie. Responses are validated with the same zod
 * schemas the client uses, so server-prefetched data is shape-identical.
 * Never cached across users: `cache: "no-store"`.
 */
async function serverFetch(
  path: string,
  { teamId }: ServerGetOptions,
): Promise<unknown> {
  const sessionId = await getSessionId();
  if (!sessionId) throw new Error("No session.");

  const headers: Record<string, string> = {
    Accept: "application/json",
    Cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
  };
  if (teamId) headers["X-Team-ID"] = teamId;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed (${response.status}).`);
  }
  return response.json();
}

function unwrapEnvelope(payload: unknown): unknown {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    "data" in payload
  ) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}

/** GET returning the envelope's `data`, validated against `schema`. */
export async function serverGet<T>(
  path: string,
  schema: z.ZodType<T>,
  options: ServerGetOptions = {},
): Promise<T> {
  return schema.parse(unwrapEnvelope(await serverFetch(path, options)));
}

export async function serverGetEnvelope<T>(
  path: string,
  schema: z.ZodType<T>,
  options: ServerGetOptions = {},
): Promise<T> {
  return schema.parse(await serverFetch(path, options));
}
