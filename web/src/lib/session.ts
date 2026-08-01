import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { env } from "@/config/env";
import {
    resolveSessionResponse,
    type Session,
    SessionUnavailableError,
    type SessionUser,
} from "@/lib/session-resolver";

const SESSION_COOKIE_NAME = "dugble_session";
const BACKEND_URL = env.BACKEND_URL.replace(/\/+$/, "");

export type { Session, SessionUser };
export { SessionUnavailableError };

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
        throw new SessionUnavailableError();
    }

    return resolveSessionResponse(response);
});

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
