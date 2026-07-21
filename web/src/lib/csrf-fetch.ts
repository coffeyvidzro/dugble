const CSRF_COOKIE_NAME = "dugble_csrf";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(encodedName));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.slice(encodedName.length));
}

export function getCsrfToken(): string {
  const token = readCookie(CSRF_COOKIE_NAME);

  if (!token || token.trim() === "") {
    throw new Error(`Missing CSRF token cookie (${CSRF_COOKIE_NAME}).`);
  }
  return token;
}

export async function csrfFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-CSRF-Token", getCsrfToken());

  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "same-origin",
  });
}
