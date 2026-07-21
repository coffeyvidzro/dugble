import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "dugble_csrf";

export async function getCsrfToken(): Promise<string> {
  const store = await cookies();
  const token = store.get(CSRF_COOKIE_NAME)?.value ?? null;

  if (!token || token.trim() === "") {
    throw new Error(`Missing CSRF token cookie (${CSRF_COOKIE_NAME}).`);
  }
  return token;
}

export async function csrfFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const store = await cookies();
  const cookieHeader = store.toString();

  const token = store.get(CSRF_COOKIE_NAME)?.value ?? "";
  if (!token.trim()) {
    throw new Error(`Missing CSRF token cookie (${CSRF_COOKIE_NAME}).`);
  }

  const headers = new Headers(init.headers);
  headers.set("X-CSRF-Token", token);
  headers.set("Cookie", cookieHeader);

  return fetch(input, {
    ...init,
    headers,
    cache: "no-store",
  });
}
