import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import { env } from "@/config/env";

const SESSION_COOKIE_NAME = "dugble_session";
const BACKEND_URL = env.BACKEND_URL.replace(/\/+$/, "");

const sessionSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.email(),
    email_verified: z.boolean(),
    name: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

const sessionResponseSchema = z.object({
  success: z.literal(true),
  data: sessionSchema,
});

export type Session = z.infer<typeof sessionSchema>;
export type SessionUser = Session["user"];

/** Returns the opaque session cookie value without exposing it to the client. */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

/** Resolves the current cookie against the authoritative Go session store. */
export const getSession = cache(async (): Promise<Session | null> => {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return null;
  }

  let response: Response;

  try {
    response = await fetch(`${BACKEND_URL}/auth/user`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.warn(
      "Unable to reach the backend while resolving the session.",
      error,
    );
    return null;
  }

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    if (isTransientUpstreamStatus(response.status)) {
      console.warn(`Unable to resolve session (${response.status}).`);
      return null;
    }

    throw new Error(`Unable to resolve session (${response.status}).`);
  }

  const payload: unknown = await response.json();
  const parsed = sessionResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("The backend returned an invalid session response.");
  }

  return parsed.data.data;
});

function isTransientUpstreamStatus(status: number): boolean {
  return [502, 503, 504, 522, 523, 524].includes(status);
}

/** Returns the current session or redirects unauthenticated users to login. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return session;
}

/** Checks for a valid backend session, not merely the presence of a cookie. */
export async function hasSession(): Promise<boolean> {
  return (await getSession()) !== null;
}
