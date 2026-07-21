import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { serverCsrfFetch } from "@/lib/server-csrf-fetch";

const SESSION_COOKIE_NAME = "dugble_session";

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
export async function getSession(): Promise<Session | null> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return null;
  }

  const response = await serverCsrfFetch("/api/v1/auth/user", {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to resolve session (${response.status}).`);
  }

  const payload: unknown = await response.json();
  const parsed = sessionResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error("The backend returned an invalid session response.");
  }

  return parsed.data.data;
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
